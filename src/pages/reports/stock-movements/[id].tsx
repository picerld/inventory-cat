"use client";

import * as React from "react";
import { useRouter } from "next/router";
import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { trpc } from "~/utils/trpc";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import Link from "next/link";
import { Button, buttonVariants } from "~/components/ui/button";
import {
  ChevronLeft,
  Package,
  Calendar,
  User,
  TrendingUp,
  TrendingDown,
  FileText,
  ShoppingCart,
  RotateCcw,
  Boxes,
  CheckCircle2,
} from "lucide-react";
import {
  itemTypeLabel,
  movementTypeBadge,
} from "~/components/features/stock-movement/lib/utils";

function qtySign(type: string) {
  if (type.endsWith("_OUT")) return "-";
  if (type.endsWith("_IN")) return "+";
  return "";
}

function getMovementIcon(type: string) {
  if (type.endsWith("_IN")) return TrendingUp;
  if (type.endsWith("_OUT")) return TrendingDown;
  return Package;
}

export default function StockMovementDetailPage() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const q = trpc.stockMovement.getById.useQuery(
    { id: id ?? "" },
    { enabled: !!id },
  );

  return (
    <GuardedLayout>
      <HeadMetaData title="Stock Movement Detail" />

      <div className="mx-auto space-y-6 pb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/reports/stock-movements"
            className={buttonVariants({
              variant: "outline",
              size: "sm",
              className: "gap-2",
            })}
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>
          <div className="h-6 w-px bg-border" />
          <h1 className="text-2xl font-semibold tracking-tight">
            Detail Laporan Stok
          </h1>
        </div>

        {!id || q.isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
            <Skeleton className="h-64 w-full rounded-2xl" />
          </div>
        ) : q.isError ? (
          <div className="rounded-2xl border border-destructive/20 bg-destructive/5 p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <FileText className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Failed to Load</h3>
            <p className="text-sm text-muted-foreground">{q.error.message}</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => router.reload()}
            >
              Try Again
            </Button>
          </div>
        ) : (
          (() => {
            const m = q.data!;
            const badge = movementTypeBadge(m.type);
            const sign = qtySign(m.type);
            const MovementIcon = getMovementIcon(m.type);
            const isIncoming = m.type.endsWith("_IN");

            const itemTitle =
              m.itemName ??
              m.refFinishedGood?.name ??
              m.refSemiFinishedGood?.name ??
              m.itemId;

            return (
              <div className="space-y-6">
                {/* Hero Card - Movement Summary */}
                <div className="relative overflow-hidden rounded-2xl border bg-gradient-to-br from-card to-muted/20 p-8">
                  <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/5 to-transparent" />
                  
                  <div className="relative flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
                    {/* Left Side - Item Info */}
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
                          <h2 className="text-2xl font-bold leading-tight">
                            {itemTitle}
                          </h2>
                          <p className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                            <Package className="h-4 w-4" />
                            {itemTypeLabel(m.itemType)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Right Side - Quantity */}
                    <div className="flex flex-col items-end justify-center rounded-2xl bg-card/80 px-8 py-6 backdrop-blur-sm md:min-w-[200px]">
                      <p className="text-sm font-medium text-muted-foreground">
                        Quantity
                      </p>
                      <p
                        className={cn(
                          "mt-1 text-5xl font-bold tabular-nums",
                          isIncoming ? "text-emerald-600" : "text-orange-600",
                        )}
                      >
                        {sign}
                        {Number(m.qty).toLocaleString("id-ID")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="grid gap-4 md:grid-cols-2">
                  {/* Metadata Card */}
                  <div className="rounded-2xl border bg-card p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      Movement Info
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <Calendar className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">
                            Created At
                          </p>
                          <p className="font-medium">
                            {new Date(m.createdAt).toLocaleString("id-ID", {
                              dateStyle: "medium",
                              timeStyle: "short",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <User className="mt-0.5 h-4 w-4 text-muted-foreground" />
                        <div className="flex-1">
                          <p className="text-xs text-muted-foreground">
                            Created By
                          </p>
                          <p className="font-medium">
                            {m.user?.name ?? "System"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats Card */}
                  <div className="rounded-2xl border bg-card p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4" />
                      Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                        <span className="text-sm text-muted-foreground">
                          Movement Type
                        </span>
                        <Badge variant="outline" className="font-mono text-xs">
                          {m.type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between rounded-xl bg-muted/50 p-3">
                        <span className="text-sm text-muted-foreground">
                          Item ID
                        </span>
                        <span className="font-mono text-sm font-medium">
                          {m.itemId?.slice(0, 12)}...
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* References Card */}
                <div className="rounded-2xl border bg-card p-6">
                  <h3 className="mb-6 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    Related References
                  </h3>

                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {/* Purchase Reference */}
                    <ReferenceCard
                      icon={ShoppingCart}
                      label="Purchase Order"
                      value={
                        m.refPurchase?.purchaseNo ?? m.refPurchaseId ?? "-"
                      }
                      hasValue={!!m.refPurchaseId}
                    />

                    {/* Sale Reference */}
                    <ReferenceCard
                      icon={TrendingUp}
                      label="Sale Order"
                      value={m.refSale?.saleNo ?? m.refSaleId ?? "-"}
                      hasValue={!!m.refSaleId}
                    />

                    {/* Return Reference */}
                    <ReferenceCard
                      icon={RotateCcw}
                      label="Return"
                      value={m.refReturn?.id ?? m.refReturnId ?? "-"}
                      hasValue={!!m.refReturnId}
                    />

                    {/* Semi Finished Good Reference */}
                    <ReferenceCard
                      icon={Boxes}
                      label="Semi Finished Good"
                      value={
                        m.refSemiFinishedGood?.name ??
                        m.refSemiFinishedGoodId ??
                        "-"
                      }
                      hasValue={!!m.refSemiFinishedGoodId}
                    />

                    {/* Finished Good Reference */}
                    <ReferenceCard
                      icon={Package}
                      label="Finished Good"
                      value={
                        m.refFinishedGood
                          ? `${m.refFinishedGood.name} (${m.refFinishedGood.productionCode})`
                          : m.refFinishedGoodId ?? "-"
                      }
                      hasValue={!!m.refFinishedGoodId}
                      className="md:col-span-2 lg:col-span-1"
                    />
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex items-center justify-between rounded-2xl border bg-muted/30 p-4">
                  <p className="text-sm text-muted-foreground">
                    Need to make changes?
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/stock-movements">View All Movements</Link>
                    </Button>
                  </div>
                </div>
              </div>
            );
          })()
        )}
      </div>
    </GuardedLayout>
  );
}

// Reference Card Component
function ReferenceCard({
  icon: Icon,
  label,
  value,
  hasValue,
  className,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  hasValue: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "group relative overflow-hidden rounded-xl border bg-card p-4 transition-all hover:shadow-md",
        hasValue ? "border-primary/20" : "border-border",
        className,
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-xl transition-colors",
            hasValue
              ? "bg-primary/10 text-primary"
              : "bg-muted text-muted-foreground",
          )}
        >
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-1 truncate text-sm font-medium",
              hasValue ? "text-foreground" : "text-muted-foreground",
            )}
          >
            {value}
          </p>
        </div>
      </div>
      {hasValue && (
        <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />
      )}
    </div>
  );
}