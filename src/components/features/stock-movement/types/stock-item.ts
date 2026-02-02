import type { ItemType, StockMovementType } from "~/types/stock-movement";

export const movementTypes: StockMovementType[] = [
  "PURCHASE_IN",
  "SALE_OUT",
  "PRODUCTION_IN",
  "PRODUCTION_OUT",
  "RETURN_IN",
  "ADJUSTMENT",
];

export const itemTypes: ItemType[] = [
  "RAW_MATERIAL",
  "SEMI_FINISHED_GOOD",
  "FINISHED_GOOD",
  "PAINT_ACCESSORIES",
];