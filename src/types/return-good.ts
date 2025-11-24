import type { FinishedGood } from "./finished-good";
import type { User } from "./user";

export type ReturnGood = {
    id: string;
    userId: string;
    user: User;
    finishedGoodId: string;
    finishedGood: FinishedGood;
    qty: number;
    from: string;
    description?: string;
    createdAt: Date;
    updatedAt: Date;
}
