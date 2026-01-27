"use client";

import * as React from "react";
import { trpc } from "~/utils/trpc";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "~/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

import type { ItemType, StockMovementType } from "~/types/stock-movement";
import {
  formatQty,
  getRefLabel,
  itemTypeLabel,
  movementTypeLabel,
} from "../lib/utils";
import useDebounce from "~/hooks/use-debounce";
import Link from "next/link";
import { RotateCcw } from "lucide-react";

const movementTypes: StockMovementType[] = [
  "PURCHASE_IN",
  "SALE_OUT",
  "PRODUCTION_IN",
  "PRODUCTION_OUT",
  "RETURN_IN",
  "ADJUSTMENT",
];

const itemTypes: ItemType[] = [
  "RAW_MATERIAL",
  "SEMI_FINISHED_GOOD",
  "FINISHED_GOOD",
  "PAINT_ACCESSORIES",
];

function badgeClassByType(t: StockMovementType) {
  switch (t) {
    case "PURCHASE_IN":
    case "PRODUCTION_IN":
    case "RETURN_IN":
      return "bg-emerald-500 text-white";
    case "SALE_OUT":
    case "PRODUCTION_OUT":
      return "bg-rose-500 text-white";
    case "ADJUSTMENT":
      return "bg-muted text-foreground";
  }
}

function topBorderByType(type: string) {
  switch (type) {
    case "PURCHASE_IN":
      return "border-t-emerald-500";
    case "SALE_OUT":
      return "border-t-rose-500";
    case "PRODUCTION_IN":
      return "border-t-blue-500";
    case "PRODUCTION_OUT":
      return "border-t-orange-500";
    case "RETURN_IN":
      return "border-t-purple-500";
    case "ADJUSTMENT":
      return "border-t-zinc-500";
    default:
      return "border-t-border";
  }
}

export function StockMovementList() {
  const [page, setPage] = React.useState(1);
  const [search, setSearch] = React.useState("");
  const [type, setType] = React.useState<StockMovementType | "ALL">("ALL");
  const [itemType, setItemType] = React.useState<ItemType | "ALL">("ALL");

  const debouncedSearch = useDebounce(search, 500);

  const queryInput = {
    page,
    perPage: 10,
    search: debouncedSearch,
    ...(type !== "ALL" ? { type } : {}),
    ...(itemType !== "ALL" ? { itemType } : {}),
  };

  const { data, isLoading, isError, error } =
    trpc.stockMovement.getPaginated.useQuery(queryInput);

  React.useEffect(() => {
    setPage(1);
  }, [search, type, itemType]);

  const resetFilter = () => {
    setSearch("");
    setType("ALL");
    setItemType("ALL");
  };

  if (isError) {
    return (
      <div className="rounded-xl border p-6">
        <p className="text-sm font-semibold">Gagal memuat stock movement.</p>
        <p className="text-muted-foreground mt-1 text-sm">{error.message}</p>
      </div>
    );
  }

  return (
    <div className="my-8 space-y-4">
      <div className="grid grid-cols-2 gap-5">
        <div className="flex gap-3">
          <Input
            placeholder="Cari nama / Nomor PO / Nomo SO..."
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
      </div>

      {data?.data?.length ? (
        <>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {data.data.map((m) => {
              const createdAt = new Date(m.createdAt);

              return (
                <Link key={m.id} href={`/reports/stock-movements/${m.id}`}>
                  <div
                    className={cn(
                      "group bg-card relative flex items-start justify-between gap-3 rounded-xl p-4",
                      "border-x border-t-[6px] border-b",
                      "transition-all",
                      "hover:-translate-y-px",
                      topBorderByType(m.type),
                    )}
                  >
                    {/* LEFT */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <Badge
                          className={cn(
                            "rounded-full px-2.5 py-0.5 text-xs",
                            badgeClassByType(m.type),
                          )}
                        >
                          {movementTypeLabel(m.type)}
                        </Badge>

                        <span className="text-muted-foreground text-xs">
                          {createdAt.toLocaleString("id-ID", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>

                      <div className="mt-2 text-sm">
                        <span className="font-medium">
                          {itemTypeLabel(m.itemType)}
                        </span>
                        <span className="text-muted-foreground"> • </span>
                        <span className="text-muted-foreground">
                          {getRefLabel(m)}
                        </span>
                      </div>

                      <div className="text-muted-foreground mt-1 text-xs">
                        By {m.user?.name ?? "-"}
                      </div>
                    </div>

                    {/* RIGHT */}
                    <div className="shrink-0 text-right">
                      <p className="text-lg font-semibold">
                        {formatQty(m.qty)}
                      </p>
                      <p className="text-muted-foreground text-xs">qty</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center justify-between">
            <p className="text-muted-foreground text-sm">
              Page {data.meta.currentPage} of {data.meta.lastPage}
            </p>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={data.meta.currentPage <= 1}
              >
                Prev
              </Button>
              <Button
                variant="outline"
                onClick={() =>
                  setPage((p) => Math.min(data.meta.lastPage, p + 1))
                }
                disabled={data.meta.currentPage >= data.meta.lastPage}
              >
                Next
              </Button>
            </div>
          </div>
        </>
      ) : (
        <div className="my-8 rounded-xl border p-6">
          <p className="text-sm font-medium">Belum ada pergerakan stok.</p>
          <p className="text-muted-foreground mt-1 text-sm">
            Coba ubah filter atau kata kunci pencarian.
          </p>

          <Button
            variant="outline"
            onClick={() => {
              resetFilter();
            }}
            className="mt-5"
          >
            Reset Filter
          </Button>
        </div>
      )}
    </div>
  );
}
