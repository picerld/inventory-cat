import { Calendar, Info, Package, ReceiptText } from "lucide-react";
import { cn, toNumber, toRupiah } from "~/lib/utils";
import type { PurchaseStatus } from "../../../config/purchase";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import type { PurchaseRawMaterialFull } from "~/types/purchase";

type PurchaseRawMaterialListProps = {
  data: PurchaseRawMaterialFull[];
  statusBadge: (status: PurchaseStatus) => { label: string; className: string };
};

export const PurchaseRawMaterialList = ({
  data,
  statusBadge,
}: PurchaseRawMaterialListProps) => {
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

        return (
          <div
            key={p.id}
            className="bg-card rounded-2xl border p-5 shadow-sm transition"
          >
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

              <Badge className={cn("rounded-full px-3 py-1", badge.className)}>
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

            {/* <div className="mt-4">
              <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                Items (Raw Material)
              </p>

              <div className="mt-2 space-y-2">
                {p.items.slice(0, 3).map((it: any) => (
                  <div
                    key={it.id}
                    className="flex items-center justify-between rounded-xl border p-3 text-sm"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">
                        {it.rawMaterial?.name ?? "Raw Material (deleted)"}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Unit: {toRupiah(toNumber(it.unitPrice))} • Subtotal:{" "}
                        {toRupiah(toNumber(it.subtotal))}
                      </p>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="font-semibold">
                        {toNumber(it.qty).toLocaleString("id-ID")}
                      </p>
                      <p className="text-muted-foreground text-xs">qty</p>
                    </div>
                  </div>
                ))}

                {p.items.length > 3 && (
                  <p className="text-muted-foreground text-xs">
                    +{p.items.length - 3} item lainnya
                  </p>
                )}
              </div>
            </div> */}

            <div className="mt-5 flex w-full items-center justify-end gap-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href={`/purchases/raw-materials/${p.id}`}>
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
