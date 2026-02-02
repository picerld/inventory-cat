"use client";

import * as React from "react";
import { trpc } from "~/utils/trpc";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
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
  badgeClassByType,
  formatQty,
  getRefLabel,
  itemTypeLabel,
  movementTypeLabel,
  topBorderByType,
} from "../lib/utils";
import useDebounce from "~/hooks/use-debounce";
import Link from "next/link";
import { Calendar, RotateCcw } from "lucide-react";
import { itemTypes, movementTypes } from "../types/stock-item";

export function StockMovementList() {
  const [page, setPage] = React.useState<number>(1);
  const [search, setSearch] = React.useState<string>("");
  const [type, setType] = React.useState<StockMovementType | "ALL">("ALL");
  const [itemType, setItemType] = React.useState<ItemType | "ALL">("ALL");
  const [groupBy, setGroupBy] = React.useState<"none" | "day" | "month">("day");

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

  const groupedData = React.useMemo(() => {
    if (!data?.data) return {};

    if (groupBy === "none") {
      return { all: data.data };
    }

    return data.data.reduce(
      (acc, movement) => {
        const date = new Date(movement.createdAt);
        let key: string;

        if (groupBy === "day") {
          key = date.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "2-digit",
            month: "long",
            year: "numeric",
          });
        } else {
          key = date.toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          });
        }

        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(movement);
        return acc;
      },
      {} as Record<string, typeof data.data>,
    );
  }, [data, groupBy]);

  const getGroupTotal = (movements: typeof data.data) => {
    return movements.reduce((sum, m) => {
      const qty = parseFloat(m.qty.toString());
      if (
        m.type === "PURCHASE_IN" ||
        m.type === "PRODUCTION_IN" ||
        m.type === "RETURN_IN"
      ) {
        return sum + qty;
      } else if (m.type === "SALE_OUT" || m.type === "PRODUCTION_OUT") {
        return sum - qty;
      }
      return sum;
    }, 0);
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

      {data?.data?.length ? (
        <>
          <div className="mt-8 space-y-8">
            {Object.entries(groupedData).map(([dateKey, movements]) => {
              const totalQty = getGroupTotal(movements);

              return (
                <div key={dateKey} className="space-y-3">
                  {/* Date Header */}
                  {groupBy !== "none" && (
                    <div className="bg-muted/50 sticky top-0 z-10 flex items-center justify-between rounded-lg border px-4 py-3 backdrop-blur-sm">
                      <div>
                        <h3 className="text-sm font-semibold">{dateKey}</h3>
                        <p className="text-muted-foreground text-xs">
                          {movements.length} transaksi
                        </p>
                      </div>
                      <div className="text-right">
                        <p
                          className={cn(
                            "text-lg font-bold",
                            totalQty > 0
                              ? "text-emerald-600"
                              : totalQty < 0
                                ? "text-rose-600"
                                : "text-muted-foreground",
                          )}
                        >
                          {totalQty > 0 ? "+" : ""}
                          {formatQty(totalQty)}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          Net Perubahan
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Movement Cards */}
                  <div className="grid grid-cols-3 gap-3">
                    {movements.map((m) => {
                      const createdAt = new Date(m.createdAt);

                      return (
                        <Link
                          key={m.id}
                          href={`/reports/stock-movements/${m.id}`}
                        >
                          <div
                            className={cn(
                              "group bg-card relative flex items-start justify-between gap-3 rounded-xl p-4",
                              "border-x border-t-[6px] border-b",
                              "transition-all",
                              "hover:-translate-y-px hover:shadow-md",
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
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>

                              <div className="mt-2 text-sm">
                                <span className="font-medium">
                                  {itemTypeLabel(m.itemType)}
                                </span>
                                <span className="text-muted-foreground">
                                  {" "}
                                  •{" "}
                                </span>
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
                              <p className="text-muted-foreground text-xs">
                                qty
                              </p>
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between pt-4">
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