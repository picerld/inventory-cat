import type { PaintGrade } from "./pain-grade";
import type { Supplier } from "./supplier";
import type { User } from "./user";

export type RawMaterial = {
    id: string;
    supplierId: string;
    supplier: Supplier;
    userId: string;
    user: User;
    paintGradeId: string;
    paintGrade: PaintGrade;
    name: string;
    qty: number;
    supplierPrice: number;
    sellingPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
