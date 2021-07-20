import { DefinitionSchema } from "./definitions_schema";

const SpaceSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": DefinitionSchema,
    "properties": {
        "author_id": {
            "type": "number"
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
        "day_rate": {
            "type": "number"
        },
        "half_day_rate": {
            "type": "number"
        },
        "host_id": {
            "type": "number"
        },
        "hourly_rate": {
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
        "is_disabled_person": {
            "type": "boolean"
        },
        "is_place_provided": {
            "type": "boolean"
        },
        "label": {
            "type": "string"
        },
        "monthly_rate": {
            "type": "number"
        },
        "pictures": {
            "items": {
                "$ref": "#/definitions/PictureInterface"
            },
            "type": "array"
        },
        "services": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "space_types": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "updated_date": {
            "type": "number"
        },
        "weekly_rate": {
            "type": "number"
        }
    },
    "type": "object"
};
export { SpaceSchema };
