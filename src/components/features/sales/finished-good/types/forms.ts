export type Line = {
  finishedGoodId: string;
  qty: number | string;
  productionCode?: string;
  name?: string;
  batchNumber?: string;
  paintGradeName?: string;
  stock?: number;
  costPrice: number;
  marginPct: number;
  unitPrice: number | string;
  lineTotal?: number | string;
};

export type ActionKey =
  | "submit"
  | "set-ongoing"
  | "set-finished"
  | "set-canceled"
  | null;
