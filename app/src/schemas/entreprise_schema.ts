import { DefinitionSchema } from "./definitions_schema";

const EntrepriseSchema = {
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
        "content": {
            "type": "string"
        },
        "created_date": {
            "type": "number"
        },
        "id": {
            "type": "number"
        },
        "label": {
            "type": "string"
        },
        "updated_date": {
            "type": "number"
        }
    },
    "type": "object"
};
export { EntrepriseSchema };
