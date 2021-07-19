import { AddressInterface } from "./address_interface";
import { HourInterface } from "./hour_interface";
import { LocalizationInterface } from "./localization_interface";
import { PictureInterface } from "./picture_interface";
import { TermInterface } from "./term_interface";

export interface HostInterface {
    author_id: number;
    vote: Array<any>;
    updated_date: number;
    type_of_contract: Array<TermInterface>;
    bus_access: string;
    created_date: number;
    phone: string;
    pictures: Array<PictureInterface>;
    parking_access: string;
    subway_access: string;
    import_id: string;
    is_internal: boolean;
    timezone: string;
    localization: LocalizationInterface;
    coverage_picture: Array<PictureInterface>;
    plain_address: string;
    hours: Array<HourInterface>;
    price: string;
    manager_id: number;
    id: number;
    content: string;
    tram_access: string;
    label: string;
    type: Array<TermInterface>;
    services: Array<TermInterface>;
    address: Array<AddressInterface>;
}