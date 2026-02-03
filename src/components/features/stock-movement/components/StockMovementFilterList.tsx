import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { ItemType, StockMovementType } from "~/types/stock-movement";
import { itemTypeLabel, movementTypeLabel } from "../lib/utils";
import { itemTypes, movementTypes } from "../types/stock-item";
import { Button } from "~/components/ui/button";
import { Calendar, RotateCcw } from "lucide-react";

type StockMovementFilterListProps = {
  search: string;
  itemType: ItemType | "ALL";
  type: StockMovementType | "ALL";
  groupBy: "none" | "day" | "month";
  setSearch: (search: string) => void;
  setItemType: (itemType: ItemType | "ALL") => void;
  setType: (type: StockMovementType | "ALL") => void;
  setGroupBy: (groupBy: "none" | "day" | "month") => void;
  resetFilter: () => void;
};

export const StockMovementFilterList = ({
  search,
  itemType,
  type,
  groupBy,
  setSearch,
  setItemType,
  setType,
  setGroupBy,
  resetFilter,
}: StockMovementFilterListProps) => {
  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <Input
          placeholder="Cari nama / Nomor PO / Nomor SO..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-xl"
        />

        <Select
          value={type}
          onValueChange={(v) => setType(v as StockMovementType | "ALL")}
        >
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Filter type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Tipe</SelectItem>
            {movementTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {movementTypeLabel(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={itemType}
          onValueChange={(v) => setItemType(v as ItemType | "ALL")}
        >
          <SelectTrigger className="h-11 rounded-xl">
            <SelectValue placeholder="Filter item type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Semua Tipe Item</SelectItem>
            {itemTypes.map((t) => (
              <SelectItem key={t} value={t}>
                {itemTypeLabel(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          type="button"
          variant="outline"
          className="rounded-xl"
          onClick={resetFilter}
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>

      <div className="flex items-center gap-2 pt-3">
        <Calendar className="text-muted-foreground h-4 w-4" />
        <span className="text-muted-foreground text-sm">Kelompokkan:</span>
        <div className="flex gap-2">
          <Button
            variant={groupBy === "none" ? "default" : "outline"}
            onClick={() => setGroupBy("none")}
            size="sm"
            className="rounded-lg"
          >
            Semua
          </Button>
          <Button
            variant={groupBy === "day" ? "default" : "outline"}
            onClick={() => setGroupBy("day")}
            size="sm"
            className="rounded-lg"
          >
            Per Hari
          </Button>
          <Button
            variant={groupBy === "month" ? "default" : "outline"}
            onClick={() => setGroupBy("month")}
            size="sm"
            className="rounded-lg"
          >
            Per Bulan
          </Button>
        </div>
      </div>
    </div>
  );
};
