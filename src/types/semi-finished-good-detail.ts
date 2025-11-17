import type { RawMaterial } from "./raw-material";
import type { SemiFinishedGood } from "./semi-finished-good";

export type SemiFinishedGoodDetail = {
    id: string;
    semiFinishedGoodId: string;
    semiFinishedGood: SemiFinishedGood;
    rawMaterialId: string;
    rawMaterial: RawMaterial;
    createdAt: Date;
    updatedAt: Date;
}
