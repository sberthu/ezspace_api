import { DefinitionSchema } from "./definitions_schema";

const AlertSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": DefinitionSchema,
    "properties": {
        "content": {
            "type": "string"
        },
        "created_date": {
            "type": "number"
        },
        "description": {
            "type": "string"
        },
        "id": {
            "type": "number"
        },
        "label": {
            "type": "string"
        },
        "level": {
            "type": "number"
        },
        "localization": {
            "$ref": "#/definitions/LocalizationInterface"
        },
        "scope": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "status": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "timestamp": {
            "type": "number"
        },
        "type": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "updated_date": {
            "type": "number"
        }
    },
    "type": "object"
};
export { AlertSchema };
