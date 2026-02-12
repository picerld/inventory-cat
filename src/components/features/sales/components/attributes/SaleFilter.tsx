"use client";

import { RefreshCcw, Search } from "lucide-react";
import type React from "react";
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
import { trpc } from "~/utils/trpc";

type SaleFilterProps = {
  search: string;
  status: StatusFilter;
  customerId?: string;
  setSearch: (v: string) => void;
  setStatus: (v: StatusFilter) => void;
  setCustomerId: (v: string | undefined) => void;
  resetFilter: () => void;
};

export const SaleFilter = ({
  search,
  status,
  customerId,
  setSearch,
  setStatus,
  setCustomerId,
  resetFilter,
}: SaleFilterProps) => {
  const { data: customers, isLoading } = trpc.customer.getAll.useQuery(
    undefined,
    { placeholderData: [] },
  );

  return (
    <div className="flex w-full flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-1 flex-col gap-3 md:flex-row md:items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="text-muted-foreground absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
          <Input
            className="h-10 rounded-xl border-2 pl-9"
            placeholder="Cari saleNo / customer / invoice..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select
          value={customerId ?? ""}
          onValueChange={(v) => {
            if (v === "All") {
              setCustomerId(undefined);
            } else {
              setCustomerId(v);
            }
          }}
        >
          <SelectTrigger className="h-10 w-full rounded-xl border-2 md:w-50">
            <SelectValue placeholder="Pilih Customer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All">Semua Customer</SelectItem>{" "}
            {customers?.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={status}
          onValueChange={(v) => setStatus(v as StatusFilter)}
        >
          <SelectTrigger className="h-10 w-full rounded-xl border-2 md:w-50">
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
          className="h-10 rounded-xl md:ml-auto"
        >
          <RefreshCcw className="mr-2 h-4 w-4" />
          Reset
        </Button>
      </div>
    </div>
  );
};
