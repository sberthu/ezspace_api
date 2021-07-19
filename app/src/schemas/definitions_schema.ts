import { AddressSchema } from "./address_schema";
import { HourSchema } from "./hour_schema";
import { LocalizationSchema } from "./localization_schema";
import { PictureSchema } from "./picture_schema";
import { TermSchema } from "./term_schema";

const DefinitionSchema = {
        "AddressInterface": AddressSchema,
        "HourInterface": HourSchema,
        "LocalizationInterface": LocalizationSchema,
        "PictureInterface": PictureSchema,
        "TermInterface":TermSchema,
};
export { DefinitionSchema }