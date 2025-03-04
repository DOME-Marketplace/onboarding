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
				"CREATE UNIQUE INDEX ` + "`" + `idx_D9YAqpWLK0` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `tokenKey` + "`" + `)"
			]
		}`), &collection); err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("text462513291")

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
				"CREATE UNIQUE INDEX ` + "`" + `idx_D9YAqpWLK0` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `tokenKey` + "`" + `)",
				"CREATE UNIQUE INDEX ` + "`" + `idx_mRyynHdxkY` + "`" + ` ON ` + "`" + `buyers` + "`" + ` (` + "`" + `ski` + "`" + `)"
			]
		}`), &collection); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(7, []byte(`{
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
		}`)); err != nil {
			return err
		}

		return app.Save(collection)
	})
}
