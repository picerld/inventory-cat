import type { User } from "./user";

export type SemiFinishedGood = {
    id: string;
    userId: string;
    user: User;
    name: string;
}
