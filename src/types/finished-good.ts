import type { User } from "./user";

export type FinishedGood = {
    id: string;
    productionCode: string;
    userId: string;
    user: User;
    name: string;
    dateProduced: Date;
    batchNumber: string;
    quality: string;
    createdAt: Date;
    updatedAt: Date;
}
