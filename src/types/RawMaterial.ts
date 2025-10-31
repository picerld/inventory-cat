import type { Supplier } from "./Supplier";
import type { User } from "./User";

export type RawMaterial = {
    id: string;
    supplierId: string;
    supplier: Supplier;
    userId: string;
    user: User;
    qty: number;
    supplierPrice: number;
    sellingPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
