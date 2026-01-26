"use client";

import * as React from "react";
import { useRouter } from "next/router";
import { trpc } from "~/utils/trpc";
import { Skeleton } from "~/components/ui/skeleton";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  Calendar,
  Package,
  ReceiptText,
  User,
  FileText,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

type PurchaseStatus = "DRAFT" | "ONGOING" | "FINISHED" | "CANCELED";

function formatIDR(value: number) {
  return `Rp ${Math.round(value).toLocaleString("id-ID")}`;
}

function statusBadge(status: PurchaseStatus) {
  const map: Record<PurchaseStatus, { label: string; className: string }> = {
    DRAFT: { label: "Draft", className: "bg-muted text-foreground" },
    ONGOING: { label: "Ongoing", className: "bg-sky-500 text-white" },
    FINISHED: { label: "Finished", className: "bg-emerald-500 text-white" },
    CANCELED: { label: "Canceled", className: "bg-destructive text-white" },
  };

  return map[status];
}

export default function PurchaseRawMaterialDetail() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const utils = trpc.useUtils();

  const { mutate: updateStatus, isPending: isUpdating } =
    trpc.purchase.updateStatus.useMutation({
      onSuccess: async () => {
        toast.success("Berhasil update status");
        if (id) {
          await utils.purchase.getByIdRawMaterial.invalidate({ id });
        }
        await utils.purchase.getPaginated?.invalidate?.();
        await utils.purchase.getRawMaterialPaginated?.invalidate?.();
        await utils.rawMaterial.getAll.invalidate();
        await utils.rawMaterial.getPaginated.invalidate();
      },
      onError: (e) =>
        toast.error("Gagal update status", { description: e.message }),
    });

  const { data, isLoading, isError, error } =
    trpc.purchase.getByIdRawMaterial.useQuery(
      { id: id ?? "" },
      { enabled: !!id },
    );

  if (isLoading || !id) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-28 w-full" />
        <Skeleton className="h-60 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="mt-10 rounded-xl border p-6">
        <p className="text-sm font-semibold">Gagal memuat detail.</p>
        <p className="text-muted-foreground mt-1 text-sm">{error.message}</p>
      </div>
    );
  }

  const purchase = data.purchase;
  const summary = data.summary;

  const badge = statusBadge(purchase.status as PurchaseStatus);

  const status = purchase.status as PurchaseStatus;
  const canOngoing = status === "DRAFT";
  const canFinish = status === "ONGOING";
  const canCancel = status === "DRAFT" || status === "ONGOING";
  const isLocked = status === "FINISHED" || status === "CANCELED";

  return (
    <div className="my-6 space-y-4">
      <div className="bg-card rounded-2xl border p-6 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <ReceiptText className="text-muted-foreground h-5 w-5" />
              <h2 className="truncate text-lg font-semibold">
                {purchase.purchaseNo}
              </h2>
            </div>

            <div className="mt-2 grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div className="text-muted-foreground flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span>
                  Supplier:{" "}
                  <span className="text-foreground font-medium">
                    {purchase.supplier.name}
                  </span>
                </span>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>
                  Created by:{" "}
                  <span className="text-foreground font-medium">
                    {purchase.user.name}
                  </span>
                </span>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>
                  Purchased at:{" "}
                  <span className="text-foreground font-medium">
                    {new Date(purchase.purchasedAt).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </span>
                </span>
              </div>

              <div className="text-muted-foreground flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>
                  Received note:{" "}
                  <span className="text-foreground font-medium">
                    {purchase.receivedNote ?? "-"}
                  </span>
                </span>
              </div>
            </div>

            {purchase.notes ? (
              <p className="text-muted-foreground mt-3 text-sm">
                Notes: {purchase.notes}
              </p>
            ) : null}
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => {
                toast.info("Oops!", {
                  description: "Fitur ini sedang dikembangkan!",
                });
              }}
            >
              <Printer className="h-4 w-4" />
              Cetak Laporan
            </Button>
            <Badge className={cn("rounded-full px-3 py-1", badge.className)}>
              {badge.label}
            </Badge>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div className="bg-muted/40 rounded-xl border p-4">
            <p className="text-muted-foreground text-xs">Total Qty</p>
            <p className="mt-1 text-2xl font-semibold">
              {summary.totalQty.toLocaleString("id-ID")}
            </p>
          </div>
          <div className="bg-muted/40 rounded-xl border p-4">
            <p className="text-muted-foreground text-xs">Total Amount</p>
            <p className="mt-1 text-2xl font-semibold">
              {formatIDR(summary.totalAmount)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {isLocked ? (
            <Button variant="outline" disabled>
              Status locked ({status})
            </Button>
          ) : (
            <>
              {canCancel && (
                <Button
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() =>
                    updateStatus({ id: purchase.id, status: "CANCELED" })
                  }
                >
                  Cancel
                </Button>
              )}

              {canOngoing && (
                <Button
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() =>
                    updateStatus({ id: purchase.id, status: "ONGOING" })
                  }
                >
                  {isUpdating ? "Updating..." : "Set Ongoing"}
                </Button>
              )}

              {canFinish && (
                <Button
                  disabled={isUpdating}
                  onClick={() =>
                    updateStatus({ id: purchase.id, status: "FINISHED" })
                  }
                >
                  {isUpdating ? "Finishing..." : "Finish (Tambah Stok)"}
                </Button>
              )}
            </>
          )}

          <Button variant={"outline"} disabled={isLocked} asChild>
            <Link
              href={`/purchases/raw-materials/${purchase.id}/edit`}
              aria-disabled={isLocked}
              onClick={(e) => {
                if (isLocked) e.preventDefault();
              }}
            >
              Edit
            </Link>
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-6 shadow-sm">
        <h3 className="text-base font-semibold">Items (Bahan Baku)</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Daftar item RAW_MATERIAL yang dibeli.
        </p>

        <div className="mt-4 space-y-2">
          {purchase.items.map((it) => (
            <div
              key={it.id}
              className="flex items-start justify-between gap-3 rounded-xl border p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {it.rawMaterial?.name ?? "Raw Material (deleted)"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Unit: {formatIDR(it.unitPrice)} • Subtotal:{" "}
                  {formatIDR(it.subtotal)}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="text-lg font-semibold">
                  {Number(it.qty as unknown as string).toLocaleString("id-ID")}
                </p>
                <p className="text-muted-foreground text-xs">qty</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
