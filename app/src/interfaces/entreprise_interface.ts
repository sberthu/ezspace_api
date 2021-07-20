import { AddressInterface } from "./address_interface";

export interface EntrepriseInterface {
    id: number;
    label: string;
    updated_date: number;
    created_date: number;
    author_id: number;

    address:Array<AddressInterface>;
    content: string;
}