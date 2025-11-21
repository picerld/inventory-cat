import type { SemiFinishedGoodDetail } from "./semi-finished-good-detail";
import type { User } from "./user";

export type SemiFinishedGood = {
  id: string;
  userId: string;
  name: string;
  qty: number;
  SemiFinishedGoodDetail: SemiFinishedGoodDetail[];
  user: User;
  createdAt: Date;
  updatedAt: Date;
};
