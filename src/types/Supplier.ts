import type { RawMaterial } from "./raw-material";

export type Supplier = {
    id: string;
    name: string;
    description?: string;
    RawMaterial?: RawMaterial[];
    createdAt: Date;
    updatedAt: Date;
}
