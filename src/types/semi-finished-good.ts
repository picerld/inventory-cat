import type { PaintGrade } from "./pain-grade";
import type { SemiFinishedGoodDetail } from "./semi-finished-good-detail";
import type { User } from "./user";

export type SemiFinishedGood = {
  id: string;
  userId: string;
  name: string;
  qty: number;
  paintGradeId: string;
  paintGrade: PaintGrade;
  SemiFinishedGoodDetail: SemiFinishedGoodDetail[];
  user: User;
  createdAt: Date;
  updatedAt: Date;
};
