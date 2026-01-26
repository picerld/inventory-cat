import { RotateCcw, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { PurchaseStatus } from "../../../config/purchase";
import type React from "react";

type PurchaseRawMaterialFilterProps = {
  search: string;
  status: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  setStatus: React.Dispatch<React.SetStateAction<PurchaseStatus | "ALL">>;
  resetFilter: () => void;
};

export const PurchaseRawMaterialFilter = ({
  search,
  status,
  setSearch,
  setStatus,
  resetFilter,
}: PurchaseRawMaterialFilterProps) => {
  return (
    <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
      <div className="relative w-full md:max-w-md">
        <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari Nomor PO / supplier / notes..."
          className="rounded-xl border-2 pl-9"
        />
      </div>

      <Select
        value={status}
        onValueChange={(v) => setStatus(v as PurchaseStatus | "ALL")}
      >
        <SelectTrigger className="h-11 w-full rounded-xl border-2 md:w-56">
          <SelectValue placeholder="Filter status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">Semua Status</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="ONGOING">Ongoing</SelectItem>
          <SelectItem value="FINISHED">Finished</SelectItem>
          <SelectItem value="CANCELED">Canceled</SelectItem>
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
  );
};
