import type { User } from "./User";

export type SemiFinishedGood = {
    id: string;
    userId: string;
    user: User;
    name: string;
}
