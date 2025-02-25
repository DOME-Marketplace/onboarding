package migrations

import (
	"encoding/json"

	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		jsonData := `{
			"authAlert": {
				"emailTemplate": {
					"body": "<p>Hello,</p>\n<p>We noticed a login to your {APP_NAME} account from a new location.</p>\n<p>If this was you, you may disregard this email.</p>\n<p><strong>If this wasn't you, you should immediately change your {APP_NAME} account password to revoke access from all other locations.</strong></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
					"subject": "Login from a new location"
				},
				"enabled": true
			},
			"authRule": "verified=true",
			"authToken": {
				"duration": 1209600
			},
			"confirmEmailChangeTemplate": {
				"body": "<p>Hello,</p>\n<p>Click on the button below to confirm your new email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-email-change/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Confirm new email</a>\n</p>\n<p><i>If you didn't ask to change your email address, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
				"subject": "Confirm your {APP_NAME} new email address"
			},
			"createRule": "",
			"deleteRule": "id = @request.auth.id",
			"emailChangeToken": {
				"duration": 1800
			},
			"fields": [
				{
					"autogeneratePattern": "[a-z0-9]{15}",
					"hidden": false,
					"id": "text3208210256",
					"max": 15,
					"min": 15,
					"name": "id",
					"pattern": "^[a-z0-9]+$",
					"presentable": false,
					"primaryKey": true,
					"required": true,
					"system": true,
					"type": "text"
				},
				{
					"cost": 11,
					"hidden": true,
					"id": "password901924565",
					"max": 0,
					"min": 8,
					"name": "password",
					"pattern": "",
					"presentable": false,
					"required": true,
					"system": true,
					"type": "password"
				},
				{
					"autogeneratePattern": "[a-zA-Z0-9_]{50}",
					"hidden": true,
					"id": "text2504183744",
					"max": 60,
					"min": 30,
					"name": "tokenKey",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": true,
					"system": true,
					"type": "text"
				},
				{
					"exceptDomains": null,
					"hidden": false,
					"id": "email3885137012",
					"name": "email",
					"onlyDomains": null,
					"presentable": false,
					"required": true,
					"system": true,
					"type": "email"
				},
				{
					"hidden": false,
					"id": "bool1547992806",
					"name": "emailVisibility",
					"presentable": false,
					"required": false,
					"system": true,
					"type": "bool"
				},
				{
					"hidden": false,
					"id": "bool256245529",
					"name": "verified",
					"presentable": false,
					"required": false,
					"system": true,
					"type": "bool"
				},
				{
					"autogeneratePattern": "users[0-9]{6}",
					"hidden": false,
					"id": "text4166911607",
					"max": 150,
					"min": 3,
					"name": "username",
					"pattern": "^[\\w][\\w\\.\\-]*$",
					"presentable": false,
					"primaryKey": false,
					"required": true,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text462513291",
					"max": 0,
					"min": 0,
					"name": "ski",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text1579384326",
					"max": 0,
					"min": 0,
					"name": "name",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"hidden": false,
					"id": "file376926767",
					"maxSelect": 1,
					"maxSize": 5242880,
					"mimeTypes": [
						"image/jpeg",
						"image/png",
						"image/svg+xml",
						"image/gif",
						"image/webp"
					],
					"name": "avatar",
					"presentable": false,
					"protected": false,
					"required": false,
					"system": false,
					"thumbs": null,
					"type": "file"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text1306065825",
					"max": 0,
					"min": 0,
					"name": "organizationIdentifier",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text3253625724",
					"max": 0,
					"min": 0,
					"name": "organization",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text4227496888",
					"max": 0,
					"min": 0,
					"name": "commonName",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text2069360702",
					"max": 0,
					"min": 0,
					"name": "serialNumber",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text1400097126",
					"max": 0,
					"min": 0,
					"name": "country",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text1192726376",
					"max": 0,
					"min": 0,
					"name": "certificatePem",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text4042183640",
					"max": 0,
					"min": 0,
					"name": "street",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text760939060",
					"max": 0,
					"min": 0,
					"name": "city",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"autogeneratePattern": "",
					"hidden": false,
					"id": "text3320367065",
					"max": 0,
					"min": 0,
					"name": "postalCode",
					"pattern": "",
					"presentable": false,
					"primaryKey": false,
					"required": false,
					"system": false,
					"type": "text"
				},
				{
					"hidden": false,
					"id": "autodate2990389176",
					"name": "created",
					"onCreate": true,
					"onUpdate": false,
					"presentable": false,
					"system": false,
					"type": "autodate"
				},
				{
					"hidden": false,
					"id": "autodate3332085495",
					"name": "updated",
					"onCreate": true,
					"onUpdate": true,
					"presentable": false,
					"system": false,
					"type": "autodate"
				}
			],
			"fileToken": {
				"duration": 120
			},
			"id": "pbc_267911307",
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_iaOgmfKLgX` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `username` + "`" + ` COLLATE NOCASE)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_ZrnZ0SLGKN` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''",
				"CREATE UNIQUE INDEX ` + "`" + `idx_D9YAqpWLK0` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_mRyynHdxkY` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `ski` + "`" + `)"
			],
			"listRule": "id = @request.auth.id",
			"manageRule": null,
			"mfa": {
				"duration": 1800,
				"enabled": false,
				"rule": ""
			},
			"name": "buyers",
			"oauth2": {
				"enabled": false,
				"mappedFields": {
					"avatarURL": "",
					"id": "",
					"name": "",
					"username": "username"
				}
			},
			"otp": {
				"duration": 180,
				"emailTemplate": {
					"body": "<p>Hello,</p>\n<p>Your one-time password is: <strong>{OTP}</strong></p>\n<p><i>If you didn't ask for the one-time password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
					"subject": "OTP for {APP_NAME}"
				},
				"enabled": false,
				"length": 8
			},
			"passwordAuth": {
				"enabled": true,
				"identityFields": [
					"email"
				]
			},
			"passwordResetToken": {
				"duration": 1800
			},
			"resetPasswordTemplate": {
				"body": "<p>Hello,</p>\n<p>Click on the button below to reset your password.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-password-reset/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Reset password</a>\n</p>\n<p><i>If you didn't ask to reset your password, you can ignore this email.</i></p>\n<p>\n  Thanks,<br/>\n  {APP_NAME} team\n</p>",
				"subject": "Reset your {APP_NAME} password"
			},
			"system": false,
			"type": "auth",
			"updateRule": "id = @request.auth.id",
			"verificationTemplate": {
				"body": "<p>Hello,</p>\n<p>Thank you for joining us at DOME Marketplace.</p>\n<p>We need you to confirm your email. Please, click on the button below to verify your email address.</p>\n<p>\n  <a class=\"btn\" href=\"{APP_URL}/_/#/auth/confirm-verification/{TOKEN}\" target=\"_blank\" rel=\"noopener\">Verify</a>\n</p>\n<p>\n  Thanks,<br/>\n  DOME Marketplace Onboarding team\n</p>",
				"subject": "Verify your email for DOME Marketplace"
			},
			"verificationToken": {
				"duration": 604800
			},
			"viewRule": "id = @request.auth.id"
		}`

		collection := &core.Collection{}
		if err := json.Unmarshal([]byte(jsonData), &collection); err != nil {
			return err
		}

		return app.Save(collection)
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_267911307")
		if err != nil {
			return err
		}

		return app.Delete(collection)
	})
}
