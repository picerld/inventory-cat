import type { Supplier } from "./Supplier";
import type { User } from "./User";

export type PainAccessories = {
    id: string;
    name: string;
    supplierId: string;
    supplier: Supplier;
    userId: string;
    user: User;
    supplierPrice: number;
    sellingPrice: number;
    qty: number;
    createdAt: Date;
    updatedAt: Date;
}
