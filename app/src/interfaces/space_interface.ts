import { AddressInterface } from "./address_interface";
import { HourInterface } from "./hour_interface";
import { LocalizationInterface } from "./localization_interface";
import { PictureInterface } from "./picture_interface";
import { TermInterface } from "./term_interface";

export interface SpaceInterface {
    id: number;
    label: string;
    updated_date: number;
    created_date: number;
    author_id: number;

    is_disabled_person:boolean;
    hours: Array<HourInterface>;
    host_id:number,
    import_id: string;
    is_place_provided:boolean;
    pictures: Array<PictureInterface>;
    coverage_picture: Array<PictureInterface>;
    services: Array<TermInterface>;
    half_day_rate:number;
    hourly_rate:number;
    day_rate:number;
    weekly_rate:number;
    monthly_rate:number;
    space_types: Array<TermInterface>;
}