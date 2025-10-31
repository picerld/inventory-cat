import type { RawMaterial } from "./RawMaterial";
import type { SemiFinishedGood } from "./SemiFinishedGood";

export type SemiFinishedGoodDetail = {
    id: string;
    semiFinishedGoodId: string;
    semiFinishedGood: SemiFinishedGood;
    rawMaterialId: string;
    rawMaterial: RawMaterial;
    createdAt: Date;
    updatedAt: Date;
}
