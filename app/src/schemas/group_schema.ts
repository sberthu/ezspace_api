import { DefinitionSchema } from "./definitions_schema"

const GroupSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": DefinitionSchema,
    "properties": {
        "address": {
            "items": {
                "$ref": "#/definitions/AddressInterface"
            },
            "type": "array"
        },
        "author_id": {
            "type": "number"
        },
        "bus_access": {
            "type": "string"
        },
        "content": {
            "type": "string"
        },
        "coverage_picture": {
            "items": {
                "$ref": "#/definitions/PictureInterface"
            },
            "type": "array"
        },
        "created_date": {
            "type": "number"
        },
        "hours": {
            "items": {
                "$ref": "#/definitions/HourInterface"
            },
            "type": "array"
        },
        "id": {
            "type": "number"
        },
        "import_id": {
            "type": "string"
        },
        "is_internal": {
            "type": "boolean"
        },
        "label": {
            "type": "string"
        },
        "localization": {
            "$ref": "#/definitions/LocalizationInterface"
        },
        "manager_id": {
            "type": "number"
        },
        "parking_access": {
            "type": "string"
        },
        "phone": {
            "type": "string"
        },
        "pictures": {
            "items": {
                "$ref": "#/definitions/PictureInterface"
            },
            "type": "array"
        },
        "plain_address": {
            "type": "string"
        },
        "price": {
            "type": "string"
        },
        "services": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "subway_access": {
            "type": "string"
        },
        "timezone": {
            "type": "string"
        },
        "tram_access": {
            "type": "string"
        },
        "type": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "type_of_contract": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "updated_date": {
            "type": "number"
        },
        "vote": {
            "items": {
            },
            "type": "array"
        }
    },
    "type": "object"
};
export { GroupSchema };