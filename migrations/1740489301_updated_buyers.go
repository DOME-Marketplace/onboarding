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
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_iaOgmfKLgX` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `username` + "`" + ` COLLATE NOCASE)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_ZrnZ0SLGKN` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''",
				"CREATE UNIQUE INDEX ` + "`" + `idx_D9YAqpWLK0` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_v5VfNupcDA` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `organizationIdentifier` + "`" + `)"
			]
		}`), &collection); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("file376926767")

		// remove field
		collection.Fields.RemoveById("text4227496888")

		// remove field
		collection.Fields.RemoveById("text1192726376")

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(8, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text1306065825",
			"max": 0,
			"min": 0,
			"name": "organizationIdentifier",
			"pattern": "",
			"presentable": false,
			"primaryKey": false,
			"required": true,
			"system": false,
			"type": "text"
		}`)); err != nil {
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
			"indexes": [
				"CREATE UNIQUE INDEX ` + "`" + `idx_iaOgmfKLgX` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `username` + "`" + ` COLLATE NOCASE)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_ZrnZ0SLGKN` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `email` + "`" + `) WHERE ` + "`" + `email` + "`" + ` != ''",
				"CREATE UNIQUE INDEX ` + "`" + `idx_D9YAqpWLK0` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `tokenKey` + "`" + `)"
			]
		}`), &collection); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(8, []byte(`{
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
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(11, []byte(`{
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
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(14, []byte(`{
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
		}`)); err != nil {
			return err
		}

		// update field
		if err := collection.Fields.AddMarshaledJSONAt(9, []byte(`{
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
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
