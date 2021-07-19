import { AddressInterface } from "./address_interface";
import { LocalizationInterface } from "./localization_interface"
import { PictureInterface } from "./picture_interface"
import { TermInterface } from "./term_interface"

export class UserInterface {
    status:boolean;
    id:number;
    firstname:string;
    name:string;
    email:string;
    phone:string;
    address:Array<AddressInterface>;
    localization:LocalizationInterface;
    working_group_id:number;
    speciality_group_id:number;
    job_type:Array<TermInterface>;
    company:number;
    services	:Array<TermInterface>;
    function:string;
    picture:Array<PictureInterface>;
    employee_type: Array<TermInterface>;
    birthday:Date;
    roles:Array<string>;
    standby:boolean;
    updates:string;
    visibility:boolean;
    nb_connexions:number  
    flow_requested:boolean;
    flow:number;
    last_access_date:number;
    created_date:number;
    updated_date:number;
}
