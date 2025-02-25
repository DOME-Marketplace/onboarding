package migrations

import (
	"github.com/pocketbase/pocketbase/core"
	m "github.com/pocketbase/pocketbase/migrations"
)

func init() {
	m.Register(func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_267911307")
		if err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(15, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text2751948971",
			"max": 0,
			"min": 0,
			"name": "learName",
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
		if err := collection.Fields.AddMarshaledJSONAt(16, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text374146240",
			"max": 0,
			"min": 0,
			"name": "learSurname",
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
		if err := collection.Fields.AddMarshaledJSONAt(17, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text2762778463",
			"max": 0,
			"min": 0,
			"name": "learNationality",
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
		if err := collection.Fields.AddMarshaledJSONAt(18, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text715580578",
			"max": 0,
			"min": 0,
			"name": "learIdcard",
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
		if err := collection.Fields.AddMarshaledJSONAt(19, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text529751561",
			"max": 0,
			"min": 0,
			"name": "learStreet",
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
		if err := collection.Fields.AddMarshaledJSONAt(20, []byte(`{
			"exceptDomains": [],
			"hidden": false,
			"id": "email1326417719",
			"name": "learEmail",
			"onlyDomains": [],
			"presentable": false,
			"required": false,
			"system": false,
			"type": "email"
		}`)); err != nil {
			return err
		}

		// add field
		if err := collection.Fields.AddMarshaledJSONAt(21, []byte(`{
			"autogeneratePattern": "",
			"hidden": false,
			"id": "text3540954673",
			"max": 0,
			"min": 0,
			"name": "learMobile",
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
	}, func(app core.App) error {
		collection, err := app.FindCollectionByNameOrId("pbc_267911307")
		if err != nil {
			return err
		}

		// remove field
		collection.Fields.RemoveById("text2751948971")

		// remove field
		collection.Fields.RemoveById("text374146240")

		// remove field
		collection.Fields.RemoveById("text2762778463")

		// remove field
		collection.Fields.RemoveById("text715580578")

		// remove field
		collection.Fields.RemoveById("text529751561")

		// remove field
		collection.Fields.RemoveById("email1326417719")

		// remove field
		collection.Fields.RemoveById("text3540954673")

		return app.Save(collection)
	})
}
