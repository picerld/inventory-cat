import type { PurchaseAccessoriesFull } from "~/types/purchase";
import type { PurchaseStatus } from "../../../config/purchase";
import { cn, toNumber, toRupiah } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import {
  Calendar,
  ChevronDown,
  Info,
  Package,
  ReceiptText,
} from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { useState } from "react";

type PurchaseAccessoriesListProps = {
  data: PurchaseAccessoriesFull[];
  statusBadge: (status: PurchaseStatus) => { label: string; className: string };
};

export const PurchaseAccessoriesList = ({
  data,
  statusBadge,
}: PurchaseAccessoriesListProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {data.map((p) => {
        const totalAmount =
          p.summary?.totalAmount ??
          p.items.reduce((sum: number, it) => sum + toNumber(it.subtotal), 0);

        const totalQty =
          p.summary?.totalQty ??
          p.items.reduce((sum: number, it) => sum + toNumber(it.qty), 0);

        const badge = statusBadge(p.status);
        const isExpanded = expandedIds.has(p.id);
        const hasItems = p.items.length > 0;

        return (
          <div
            key={p.id}
            className="bg-card rounded-2xl border shadow-sm transition-all hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <ReceiptText className="text-muted-foreground h-4 w-4" />
                    <p className="truncate text-base font-semibold">
                      {p.purchaseNo}
                    </p>
                  </div>

                  <p className="text-muted-foreground mt-1 truncate text-sm">
                    Supplier:{" "}
                    <span className="font-medium">{p.supplier.name}</span>
                  </p>

                  <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {new Date(p.purchasedAt).toLocaleDateString("id-ID", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                    <span>•</span>
                    <span>By {p.user.name}</span>
                  </div>
                </div>

                <Badge
                  className={cn("rounded-full px-3 py-1", badge.className)}
                >
                  {badge.label}
                </Badge>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="bg-muted/40 rounded-xl border p-3">
                  <div className="text-muted-foreground flex items-center gap-2 text-xs">
                    <Package className="h-3.5 w-3.5" />
                    Total Qty
                  </div>
                  <p className="mt-1 text-lg font-semibold">
                    {totalQty.toLocaleString("id-ID")}
                  </p>
                </div>

                <div className="bg-muted/40 rounded-xl border p-3">
                  <div className="text-muted-foreground text-xs">
                    Total Amount
                  </div>
                  <p className="mt-1 text-lg font-semibold">
                    {toRupiah(totalAmount)}
                  </p>
                </div>
              </div>

              {hasItems && (
                <button
                  onClick={() => toggleExpand(p.id)}
                  className="bg-muted/30 hover:bg-muted/50 mt-4 flex w-full cursor-pointer items-center justify-between rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors"
                >
                  <span className="text-muted-foreground">
                    {p.items.length} Item Bahan Baku
                  </span>
                  <ChevronDown
                    className={cn(
                      "text-muted-foreground h-4 w-4 transition-transform duration-200",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>
              )}
            </div>

            {hasItems && (
              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out",
                  isExpanded
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <div className="bg-muted/20 border-t px-5 py-4">
                    <div className="space-y-2">
                      {p.items.map((it: any) => (
                        <div
                          key={it.id}
                          className="bg-card hover:bg-muted/30 flex items-center justify-between rounded-lg border p-3 text-sm transition-colors"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">
                              {it.accessory.name ?? "Unnamed Accessory"}
                            </p>
                            <div className="text-muted-foreground mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                              <span>
                                Harga: {toRupiah(toNumber(it.unitPrice))}
                              </span>
                              <span className="text-muted-foreground/50">
                                •
                              </span>
                              <span>
                                Subtotal: {toRupiah(toNumber(it.subtotal))}
                              </span>
                            </div>
                          </div>

                          <div className="ml-3 shrink-0 text-right">
                            <p className="text-base font-semibold">
                              {toNumber(it.qty).toLocaleString("id-ID")}
                            </p>
                            <p className="text-muted-foreground text-xs">qty</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="bg-muted/10 border-t px-5 py-3">
              <Button className="w-full" variant="default" asChild>
                <Link href={`/purchases/accessories/${p.id}`}>
                  <Info className="h-4 w-4" /> Detail
                </Link>
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
