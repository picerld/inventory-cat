import { RefreshCcw, Search } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import type { StatusFilter } from "~/types/sale";

type SaleFilterProps = {
  search: string;
  status: StatusFilter;
  setSearch: (v: string) => void;
  setStatus: (v: StatusFilter) => void;
  resetFilter: () => void;
};

export const SaleFilter = ({
  search,
  status,
  setSearch,
  setStatus,
  resetFilter,
}: SaleFilterProps) => {
  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            className="h-10 pl-9 rounded-xl border-2"
            placeholder="Cari saleNo / customer / invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
        >
          <SelectTrigger className="h-10 w-full md:w-50 rounded-xl border-2">
            <SelectValue placeholder="Status" />
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
          variant="outline"
          onClick={resetFilter}
          className="h-10 md:ml-auto rounded-xl"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};
