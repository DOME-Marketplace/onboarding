package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_267911307")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"verificationTemplate": {
				"body": "<p>Hello, {RECORD:commonName}</p>\n<p>Thank you for joining us at DOME Marketplace as a Buyer.</p>\n<p>We need you to confirm your email. Please, click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  DOME Marketplace Onboarding team\n</p>"
			}
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_267911307")
		if err != nil {
			return err
		}

		// update collection data
		if err := json.Unmarshal([]byte(`{
			"verificationTemplate": {
				"body": "<p>Hello,</p>\n<p>Thank you for joining us at DOME Marketplace as a Buyer.</p>\n<p>We need you to confirm your email. Please, click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  DOME Marketplace Onboarding team\n</p>"
			}
		}`), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
