import { DefinitionSchema } from "./definitions_schema"

const GroupSchema = {
    "$schema": "http://json-schema.org/draft-07/schema#",
    "definitions": DefinitionSchema,
    "properties": {
        "author_id": {
            "type": "number"
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
        "is_private": {
            "type": "boolean"
        },
        "label": {
            "type": "string"
        },
        "manager_id": {
            "type": "number"
        },
        "role": {
            "type": "string"
        },
        "updated_date": {
            "type": "number"
        },
        "vice_manager_id": {
            "type": "number"
        }
    },
    "type": "object"
};
export { GroupSchema };