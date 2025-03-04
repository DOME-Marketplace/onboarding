package onboarding

import (
	"io"
	"log"
	"net/mail"
	"os"
	"path/filepath"
	"strings"

	my "github.com/hesusruiz/vcutils/yaml"
	"github.com/pocketbase/pocketbase"
	"github.com/pocketbase/pocketbase/apis"
	"github.com/pocketbase/pocketbase/core"
	"github.com/pocketbase/pocketbase/tools/mailer"
	"github.com/pocketbase/pocketbase/tools/router"
	pbtemplate "github.com/pocketbase/pocketbase/tools/template"
)

type OnboardServer struct {
	App               *pocketbase.PocketBase
	config            *Config
	treg              *pbtemplate.Registry
	generalLoginRoute *router.Route[*core.RequestEvent]
}

// New creates an instance of the Issuer, not started yet
func New(cfg *my.YAML) *OnboardServer {

	// Get the configuration struct
	config, err := ConfigFromMap(cfg)
	if err != nil {
		panic(err)
	}

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

			// bcc, cc, attachments and custom headers are also supported...
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
