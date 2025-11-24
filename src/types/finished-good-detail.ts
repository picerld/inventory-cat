import type { FinishedGood } from "./finished-good";
import type { RawMaterial } from "./raw-material";

export type FinishedGoodDetail = {
  id: string;
  finishedGoodId: string;
  finishedGood: FinishedGood;
  rawMaterialId: string;
  rawMaterial: RawMaterial;
  qty: number;
  createdAt: Date;
  updatedAt: Date;
};
