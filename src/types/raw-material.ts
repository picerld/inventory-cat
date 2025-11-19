import type { Supplier } from "./supplier";
import type { User } from "./user";

export type RawMaterial = {
    id: string;
    supplierId: string;
    supplier: Supplier;
    userId: string;
    name: string;
    user: User;
    qty: number;
    supplierPrice: number;
    sellingPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
