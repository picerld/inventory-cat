import type { FinishedGoodDetail } from "./finished-good-detail";
import type { PaintGrade } from "./pain-grade";
import type { User } from "./user";

export type FinishedGood = {
    id: string;
    productionCode: string;
    userId: string;
    user: User;
    name: string;
    qty: number;
    batchNumber: string;
    paintGradeId: string;
    sourceType: "RAW_MATERIAL" | "SEMI_FINISHED";
    paintGrade: PaintGrade;
    finishedGoodDetails: FinishedGoodDetail[];
    dateProduced: Date;
    createdAt: Date;
    updatedAt: Date;
}
