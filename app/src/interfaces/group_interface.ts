import { boolean } from "yargs";

export interface GroupInterface {
    id: number;
    label: string;
    updated_date: number;
    created_date: number;
    author_id: number;
    description: string
    manager_id: number;
    vice_manager_id: number;
    is_private: boolean;
    role: string;
}