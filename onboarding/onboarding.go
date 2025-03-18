package onboarding

import (
	"crypto/ecdsa"
	"crypto/x509"
	"encoding/pem"
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
	config.PrivateKey = privKeyAny.(*ecdsa.PrivateKey)

	// Read the LEARCredentialMachine and set in the config struct
	buf, err := os.ReadFile(config.MachineCredentialFile)
	if err != nil {
		panic(err)
	}
	config.MachineCredential = string(buf)

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
	// cfg := is.cfg

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
		pbSettings.Logs.MaxDays = 2

		pbSettings.Meta.SenderName = is.config.SenderName
		pbSettings.Meta.SenderAddress = is.config.SenderAddress

		// The email server config for sending emails
		pbSettings.SMTP.Enabled = is.config.SMTP.Enabled
		pbSettings.SMTP.Host = is.config.SMTP.Host
		pbSettings.SMTP.Port = is.config.SMTP.Port
		pbSettings.SMTP.TLS = is.config.SMTP.Tls
		pbSettings.SMTP.Username = is.config.SMTP.Username

		// Write the settings to the database
		err := se.App.Save(pbSettings)
		if err != nil {
			return err
		}
		log.Println("Running as", pbSettings.Meta.AppName, "in", pbSettings.Meta.AppURL)

		// Create the default admin if needed
		adminEmail := is.config.AdminEmail
		if len(adminEmail) == 0 {
			log.Fatal("Email for server administrator is not specified in the configuration file")
		}

		// admin, err := dao.FindAdminByEmail(adminEmail)
		// if err != nil {
		// 	return err
		// }
		// if admin == nil {
		// 	admin = &models.Admin{}
		// 	admin.Email = adminEmail
		// 	admin.SetPassword("1234567890")
		// 	err = dao.SaveAdmin(admin)
		// 	if err != nil {
		// 		return err
		// 	}
		// 	log.Println("Default Admin added:", admin.Email)
		// } else {
		// 	log.Println("Default Admin already existed:", admin.Email)
		// }

		// Serves static files from the provided public dir (if exists)
		fsys := os.DirFS("./docs")
		se.Router.GET("/{path...}", apis.Static(fsys, false))

		return se.Next()
	})

	app.OnRecordAuthWithOTPRequest("buyers").BindFunc(func(e *core.RecordAuthWithOTPRequestEvent) error {

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
					SerialNumber:           "12345678D",
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

		// Retrieve the terms and conditions files to send to customer
		tandcs, err := e.App.FindAllRecords("tandc")
		if err != nil {
			return err
		}

		attachments := map[string]io.Reader{}
		for _, record := range tandcs {
			fileName := record.GetString("name")
			avatarKey := record.BaseFilesPath() + "/" + record.GetString("file")
			// retrieve a file reader for the avatar key
			r, err := fsys.GetFile(avatarKey)
			if err != nil {
				return err
			}
			defer r.Close()

			attachments[fileName] = r

		}

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

		message := &mailer.Message{
			From: mail.Address{
				Address: e.App.Settings().Meta.SenderAddress,
				Name:    e.App.Settings().Meta.SenderName,
			},
			To:          []mail.Address{{Address: e.Record.Email()}},
			Bcc:         []mail.Address{{Address: "hesus.ruiz@gmail.com"}},
			Subject:     "Welcome to DOME Marketplace",
			HTML:        emailBody,
			Attachments: attachments,
		}

		return e.App.NewMailClient().Send(message)
	})

	return is.App.Start()
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
