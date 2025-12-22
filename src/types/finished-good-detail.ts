import type { FinishedGood } from "./finished-good";
import type { RawMaterial } from "./raw-material";
import type { SemiFinishedGood } from "./semi-finished-good";

export type FinishedGoodDetail = {
  id: string;
  finishedGoodId: string;
  finishedGood: FinishedGood;
  rawMaterialId: string;
  rawMaterial: RawMaterial;
  semiFinishedGoodId: string;
  semiFinishedGood: SemiFinishedGood;
  qty: number;
  createdAt: Date;
  updatedAt: Date;
};
