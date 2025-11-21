import type { FinishedGoodDetail } from "./finished-good-detail";
import type { User } from "./user";

export type FinishedGood = {
    id: string;
    productionCode: string;
    userId: string;
    user: User;
    name: string;
    qty: number;
    batchNumber: string;
    quality: string;
    finishedGoodDetails: FinishedGoodDetail[];
    dateProduced: Date;
    createdAt: Date;
    updatedAt: Date;
}
