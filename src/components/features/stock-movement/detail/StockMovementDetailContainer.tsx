import type { StockMovementRow } from "~/types/stock-movement";
import {
  getMovementIcon,
  itemTypeLabel,
  movementTypeBadge,
  movementTypeLabel,
  qtySign,
} from "../lib/utils";
import { cn } from "~/lib/utils";
import { Badge } from "~/components/ui/badge";
import {
  Boxes,
  Calendar,
  CheckCircle2,
  FileText,
  Package,
  RotateCcw,
  ShoppingCart,
  TrendingUp,
  User,
} from "lucide-react";
import { StockMovementReferenceCard } from "./StockMovementReferenceCard";
import { Button } from "~/components/ui/button";
import Link from "next/link";

type StockMovementDetailContainerProps = {
  q: StockMovementRow;
};

export const StockMovementDetailContainer = ({
  q,
}: StockMovementDetailContainerProps) => {
  const badge = movementTypeBadge(q.type);
  const sign = qtySign(q.type);
  const MovementIcon = getMovementIcon(q.type);
  const isIncoming = q.type.endsWith("_IN");

  const itemTitle =
    q.itemName ??
    q.refFinishedGood?.name ??
    q.refSemiFinishedGood?.name ??
    q.itemId;

  return (
    <div className="space-y-6">
      <div className="from-card to-muted/20 relative overflow-hidden rounded-2xl border bg-linear-to-br p-8">
        <div className="from-primary/5 absolute top-0 right-0 h-full w-1/3 bg-linear-to-l to-transparent" />
        <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
          <div className="flex-1 space-y-4">
            <div className="flex items-start gap-4">
              <div
                className={cn(
                  "flex h-14 w-14 items-center justify-center rounded-2xl shadow-sm",
                  isIncoming
                    ? "bg-emerald-500/10 text-emerald-600"
                    : "bg-orange-500/10 text-orange-600",
                )}
              >
                <MovementIcon className="h-7 w-7" />
              </div>
              <div className="min-w-0 flex-1">
                <Badge
                  className={cn(
                    "mb-2 rounded-full px-3 py-1 text-xs font-medium",
                    badge.className,
                  )}
                >
                  {badge.label}
                </Badge>
                <h2 className="text-2xl leading-tight font-bold">
                  {itemTitle}
                </h2>
                <p className="text-muted-foreground mt-1 flex items-center gap-2 text-sm">
                  <Package className="h-4 w-4" />
                  {itemTypeLabel(q.itemType)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-card/80 flex flex-col items-end justify-center rounded-2xl px-8 py-6 backdrop-blur-sm md:min-w-[200px]">
            <p className="text-muted-foreground text-sm font-medium">
              Quantity
            </p>
            <p
              className={cn(
                "mt-1 text-5xl font-bold tabular-nums",
                isIncoming ? "text-emerald-600" : "text-orange-600",
              )}
            >
              {sign}
              {Number(q.qty).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="bg-card rounded-2xl border p-6">
          <h3 className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
            <FileText className="h-4 w-4" />
            Movement Info
          </h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1">
                <p className="text-muted-foreground text-xs">Created At</p>
                <p className="font-medium">
                  {new Date(q.createdAt).toLocaleString("id-ID", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <User className="text-muted-foreground mt-0.5 h-4 w-4" />
              <div className="flex-1">
                <p className="text-muted-foreground text-xs">Created By</p>
                <p className="font-medium">{q.user?.name ?? "System"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl border p-6">
          <h3 className="text-muted-foreground mb-4 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
            <CheckCircle2 className="h-4 w-4" />
            Summary
          </h3>
          <div className="space-y-3">
            <div className="bg-muted/50 flex items-center justify-between rounded-xl p-3">
              <span className="text-muted-foreground text-sm">
                Movement Type
              </span>
              <Badge variant="outline" className="font-mono text-xs">
                {movementTypeLabel(q.type)}
              </Badge>
            </div>
            <div className="bg-muted/50 flex items-center justify-between rounded-xl p-3">
              <span className="text-muted-foreground text-sm">Item ID</span>
              <span className="font-mono text-sm font-medium">
                {q.itemId?.slice(0, 12)}...
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-6">
        <h3 className="text-muted-foreground mb-6 flex items-center gap-2 text-sm font-semibold tracking-wide uppercase">
          <FileText className="h-4 w-4" />
          Related References
        </h3>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <StockMovementReferenceCard
            icon={ShoppingCart}
            label="Purchase Order"
            value={q.refPurchase?.purchaseNo ?? q.refPurchaseId ?? "-"}
            hasValue={!!q.refPurchaseId}
          />

          <StockMovementReferenceCard
            icon={TrendingUp}
            label="Sale Order"
            value={q.refSale?.saleNo ?? q.refSaleId ?? "-"}
            hasValue={!!q.refSaleId}
          />

          <StockMovementReferenceCard
            icon={RotateCcw}
            label="Return"
            value={q.refReturn?.id ?? q.refReturnId ?? "-"}
            hasValue={!!q.refReturnId}
          />

          <StockMovementReferenceCard
            icon={Boxes}
            label="Semi Finished Good"
            value={
              q.refSemiFinishedGood?.name ?? q.refSemiFinishedGoodId ?? "-"
            }
            hasValue={!!q.refSemiFinishedGoodId}
          />

          <StockMovementReferenceCard
            icon={Package}
            label="Finished Good"
            value={
              q.refFinishedGood
                ? `${q.refFinishedGood.name} (${q.refFinishedGood.productionCode})`
                : (q.refFinishedGoodId ?? "-")
            }
            hasValue={!!q.refFinishedGoodId}
            className="md:col-span-2 lg:col-span-1"
          />
        </div>
      </div>

      <div className="bg-muted/30 flex items-center justify-between rounded-2xl border p-4">
        <p className="text-muted-foreground text-sm">Need to make changes?</p>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/reports/stock-movements">View All Movements</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};
