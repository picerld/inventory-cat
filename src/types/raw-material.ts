import type { Supplier } from "./supplier";
import type { User } from "./user";

export type RawMaterial = {
    id: string;
    supplierId: string;
    supplier: Supplier;
    userId: string;
    user: User;
    name: string;
    qty: number;
    materialType: string; // LEM, THINNER, DLL
    supplierPrice: number;
    createdAt: Date;
    updatedAt: Date;
}
