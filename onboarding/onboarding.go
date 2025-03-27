package onboarding

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/pem"
	"fmt"
	"io"
	"log"
	"net/mail"
	"os"
	"path/filepath"
	"strings"

	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/mailer"
	pbtemplate "github.com/pocketbase/pocketbase/tools/template"
)

type OnboardServer struct {
	App    *pocketbase.PocketBase
	config *Config
	treg   *pbtemplate.Registry
}

// New creates an instance of the Issuer, not started yet
func New(config *Config) *OnboardServer {

	// Read the private key and set in theconfig struct
	pemBytesRaw, err := os.ReadFile(config.PrivateKeyFilePEM)
	if err != nil {
		panic(err)
	}

	// Decode from the PEM format
	pemBlock, _ := pem.Decode(pemBytesRaw)
	privKeyAny, err := x509.ParsePKCS8PrivateKey(pemBlock.Bytes)
	if err != nil {
		panic(err)
	}

	// And set into the configuration struct
	config.privateKey = privKeyAny.(*ecdsa.PrivateKey)

	// Read the LEARCredentialMachine and set in the config struct
	buf, err := os.ReadFile(config.MachineCredentialFile)
	if err != nil {
		panic(err)
	}
	config.machineCredential = string(buf)

	// Read the SMTP server password and set in the config struct
	pass, err := os.ReadFile(config.SMTP.PasswordFile)
	if err != nil {
		panic(err)
	}
	config.SMTP.password = string(pass)

	is := &OnboardServer{}

	_, isUsingGoRun := inspectRuntime()

	// Create the Pocketbase instance with default configuration
	is.App = pocketbase.NewWithConfig(pocketbase.Config{
		DefaultDev: isUsingGoRun,
	})

	// is.cfg = cfg
	is.config = config

	return is
}

func (is *OnboardServer) Start() error {

	app := is.App

	fmt.Println("*****************************************")
	if app.IsDev() {
		fmt.Println("I AM RUNNING IN DEV MODE")
	} else {
		fmt.Println("I AM RUNNING IN PROD MODE")
	}
	fmt.Println("*****************************************")

	// Create the HTML templates registry, adding the 'sprig' utility functions
	is.treg = pbtemplate.NewRegistry()
	// is.treg.AddFuncs(sprig.FuncMap())

	// Perform initialization of Pocketbase before serving requests
	app.OnServe().BindFunc(func(se *core.ServeEvent) error {

		// The configured listen address for the server
		se.Server.Addr = is.config.ListenAddress

		// The default Settings
		pbSettings := se.App.Settings()
		pbSettings.Meta.AppName = is.config.AppName
		pbSettings.Meta.AppURL = is.config.ServerURL
		pbSettings.Logs.MaxDays = 7

		pbSettings.Meta.SenderName = is.config.SenderName
		pbSettings.Meta.SenderAddress = is.config.SenderAddress

		// The email server config for sending emails
		pbSettings.SMTP.Enabled = is.config.SMTP.Enabled
		pbSettings.SMTP.Host = is.config.SMTP.Host
		pbSettings.SMTP.Port = is.config.SMTP.Port
		pbSettings.SMTP.TLS = is.config.SMTP.Tls
		pbSettings.SMTP.Username = is.config.SMTP.Username
		pbSettings.SMTP.Password = is.config.SMTP.password

		pbSettings.TrustedProxy.Headers = []string{"X-Forwarded-For"}
		pbSettings.RateLimits.Enabled = true

		// Write the settings to the database
		err := se.App.Save(pbSettings)
		if err != nil {
			return err
		}
		log.Println("Running as", pbSettings.Meta.AppName, "in", pbSettings.Meta.AppURL)

		// Serves static files from the provided public dir (if exists)
		fsys := os.DirFS("./docs")
		se.Router.GET("/{path...}", apis.Static(fsys, false))

		return se.Next()
	})

	app.OnRecordAuthWithOTPRequest("buyers").BindFunc(func(e *core.RecordAuthWithOTPRequestEvent) error {

		// The user successfully verified his email (via an OTP)
		// Build the data needed to create a LEARCredentialMachine
		l := &LEARIssuanceRequestBody{
			Schema:        "LEARCredentialEmployee",
			OperationMode: "S",
			Format:        "jwt_vc_json",
			Payload: Payload{
				Mandator: Mandator{
					OrganizationIdentifier: e.Record.GetString("organizationIdentifier"),
					Organization:           e.Record.GetString("organization"),
					Country:                e.Record.GetString("country"),
					CommonName:             e.Record.GetString("name"),
					EmailAddress:           e.Record.GetString("email"),
				},
				Mandatee: Mandatee{
					FirstName:   e.Record.GetString("learFirstName"),
					LastName:    e.Record.GetString("learLastName"),
					Nationality: e.Record.GetString("learNationality"),
					Email:       e.Record.GetString("learEmail"),
				},
				Power: []Power{
					{
						Type:     "domain",
						Domain:   "DOME",
						Function: "Onboarding",
						Action:   Strings{"execute"},
					},
				},
			},
		}

		// Call the Credential Issuer to automatically issue a LEARCredentialEmployee
		_, err := LEARIssuanceRequest(is.config, l)
		if err != nil {
			e.App.Logger().Error("issuing LEARCredentialEmployee",
				"organizationIdentifier", e.Record.GetString("organizationIdentifier"),
				"organization", e.Record.GetString("organization"),
				"name", e.Record.GetString("name"),
				"learFirstName", e.Record.GetString("learFirstName"),
				"learLastName", e.Record.GetString("learLastName"),
				"learEmail", e.Record.GetString("learEmail"),
			)
			return err
		}

		e.App.Logger().Info("LEARCredentialEmployee issued",
			"organizationIdentifier", e.Record.GetString("organizationIdentifier"),
			"organization", e.Record.GetString("organization"),
			"name", e.Record.GetString("name"),
			"learFirstName", e.Record.GetString("learFirstName"),
			"learLastName", e.Record.GetString("learLastName"),
			"learEmail", e.Record.GetString("learEmail"),
		)

		// After successful issuance, we will send notification emails to several accounts,
		// as record keeping for the user and for the administration teams in DOME

		// initialize the filesystem
		fsys, err := app.NewFilesystem()
		if err != nil {
			return err
		}
		defer fsys.Close()

		// Allow standard actions before sending the email
		if err := e.Next(); err != nil {
			return err
		}

		// Retrieve the terms and conditions files to send to customer as attachments
		tandcs, err := e.App.FindAllRecords("tandc")
		if err != nil {
			return err
		}

		attachments := map[string]io.Reader{}
		for _, record := range tandcs {
			fileName := record.GetString("name")
			fileKey := record.BaseFilesPath() + "/" + record.GetString("file")
			// retrieve a file reader for the file
			r, err := fsys.GetFile(fileKey)
			if err != nil {
				return err
			}
			defer r.Close()

			attachments[fileName] = r

		}

		// Build the email body with the registration data
		emailBody, err := is.treg.LoadFiles(
			"templates/email/welcome.html",
		).Render(map[string]any{
			"name":                   e.Record.GetString("name"),
			"email":                  e.Record.GetString("email"),
			"organization":           e.Record.GetString("organization"),
			"street":                 e.Record.GetString("street"),
			"city":                   e.Record.GetString("city"),
			"postalCode":             e.Record.GetString("postalCode"),
			"country":                e.Record.GetString("country"),
			"organizationIdentifier": e.Record.GetString("organizationIdentifier"),
			"learFirstName":          e.Record.GetString("learFirstName"),
			"learLastName":           e.Record.GetString("learLastName"),
			"learNationality":        e.Record.GetString("learNationality"),
			"learIdcard":             e.Record.GetString("learIdcard"),
			"learStreet":             e.Record.GetString("learStreet"),
			"learEmail":              e.Record.GetString("learEmail"),
			"learMobile":             e.Record.GetString("learMobile"),
		})
		if err != nil {
			return err
		}

		// Send email to registered user and to other configured DOME accounts
		bcc := []mail.Address{}
		for _, email := range is.config.SupportTeamEmail {
			bcc = append(bcc, mail.Address{Address: email})
		}

		message := &mailer.Message{
			From: mail.Address{
				Address: e.App.Settings().Meta.SenderAddress,
				Name:    e.App.Settings().Meta.SenderName,
			},
			To:          []mail.Address{{Address: e.Record.Email()}},
			Bcc:         bcc,
			Subject:     "Welcome to DOME Marketplace",
			HTML:        emailBody,
			Attachments: attachments,
		}

		return e.App.NewMailClient().Send(message)
	})

	// If running in dev mode, erase ALL registrations at 10 minutes past midnigh (after backup)
	if is.App.IsDev() {
		app.Cron().MustAdd("resetregs", "10 0 * * *", func() {
			log.Println("Hello!")
			collection, err := app.FindCollectionByNameOrId("example")
			if err != nil {
				app.Logger().Error("running cron job to erase buyers", "error", err.Error())
				return
			}
			app.TruncateCollection(collection)
		})
	}

	err := is.App.Start()
	if err != nil {
		return err
	}

	return nil
}

func inspectRuntime() (baseDir string, withGoRun bool) {
	if strings.HasPrefix(os.Args[0], os.TempDir()) {
		// probably ran with go run
		withGoRun = true
		baseDir, _ = os.Getwd()
	} else {
		// probably ran with go build
		withGoRun = false
		baseDir = filepath.Dir(os.Args[0])
	}
	return
}
