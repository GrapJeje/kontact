import type {Address} from "./Address.ts";
import type {Relationship} from "./Relationship.ts";

export interface Contact {
    id: number;
    name: string;
    username: string | null;
    email: string | null;
    address: Address | null;
    relationship?: Relationship;
}
