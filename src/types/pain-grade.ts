import type { RawMaterial } from "./raw-material";

export type PaintGrade = {
    id: string;
    name: string;
    description?: string;
    rawMaterials: RawMaterial[];
    createdAt: Date;
    updatedAt: Date;
}
