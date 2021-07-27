import { LocalizationInterface } from "./localization_interface"
import { TermInterface } from "./term_interface"

export class AlertInterface {
    id: number;
    label: string;
    updated_date: number;
    created_date: number;

    content:string;
    timestamp:number;
    description:string;
    localization:LocalizationInterface;
    level:number;
    scope:Array<TermInterface>;
    status:Array<TermInterface>;
    type:Array<TermInterface>;
}
