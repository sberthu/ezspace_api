import { DefinitionSchema } from "./definitions_schema";

const UserSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": DefinitionSchema,
    "properties": {
        "address": {
            "items": {
                "$ref": "#/definitions/AddressInterface"
            },
            "type": "array"
        },
        "birthday": {
            "format": "date-time",
            "type": "string"
        },
        "company": {
            "type": "number"
        },
        "created_date": {
            "type": "number"
        },
        "email": {
            "type": "string"
        },
        "employee_type": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "firstname": {
            "type": "string"
        },
        "flow": {
            "type": "number"
        },
        "flow_requested": {
            "type": "boolean"
        },
        "function": {
            "type": "string"
        },
        "id": {
            "type": "number"
        },
        "job_type": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "last_access_date": {
            "type": "number"
        },
        "localization": {
            "$ref": "#/definitions/LocalizationInterface"
        },
        "name": {
            "type": "string"
        },
        "nb_connexions": {
            "type": "number"
        },
        "phone": {
            "type": "string"
        },
        "picture": {
            "items": {
                "$ref": "#/definitions/PictureInterface"
            },
            "type": "array"
        },
        "roles": {
            "items": {
                "type": "string"
            },
            "type": "array"
        },
        "services": {
            "items": {
                "$ref": "#/definitions/TermInterface"
            },
            "type": "array"
        },
        "speciality_group_id": {
            "type": "number"
        },
        "standby": {
            "type": "boolean"
        },
        "status": {
            "type": "boolean"
        },
        "updated_date": {
            "type": "number"
        },
        "updates": {
            "type": "string"
        },
        "visibility": {
            "type": "boolean"
        },
        "working_group_id": {
            "type": "number"
        }
    },
    "type": "object"
};
export {UserSchema};