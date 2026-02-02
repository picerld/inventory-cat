import { useRouter } from "next/router";
import { toast } from "sonner";
import { Skeleton } from "~/components/ui/skeleton";
import { cn, statusBadge, toRupiah } from "~/lib/utils";
import { trpc } from "~/utils/trpc";
import type { PurchaseStatus } from "../../config/purchase";
import { Calendar, CheckCircle2, FileText, Lock, Package, PackageCheck, Printer, ReceiptText, ShieldAlert, SquarePen, TriangleAlert, Truck, User } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ConfirmActionDialog } from "~/components/dialog/ConfirmActionDialog";

export default function PurchaseAccessoriesDetail() {
  const router = useRouter();
  const id = router.query.id as string | undefined;

  const utils = trpc.useUtils();

  const { mutate: updateStatus, isPending: isUpdating } =
    trpc.purchase.updateStatus.useMutation({
      onSuccess: async () => {
        toast.success("Sukses!", {
          description: "Status pembelian berhasil diperbarui.",
        });

        await utils.purchase.getByIdAccessories.invalidate({ id });
        await utils.purchase.getPaginated?.invalidate?.();
        await utils.purchase.getAccessoriesPaginated?.invalidate?.();
        await utils.accessories.getAll.invalidate();
        await utils.accessories.getPaginated.invalidate();
      },
      onError: (e) =>
        toast.error("Gagal update status", { description: e.message }),
    });

  const { data, isLoading, isError, error } =
    trpc.purchase.getByIdAccessories.useQuery(
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
              {toRupiah(summary.totalAmount)}
            </p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap justify-end gap-2">
          {isLocked ? (
            <Button variant="outline" disabled>
              <Lock className="size-4" /> Status locked ({status})
            </Button>
          ) : (
            <>
              {canCancel && (
                <ConfirmActionDialog
                  trigger={
                    <Button variant="destructive" disabled={isUpdating}>
                      <TriangleAlert className="size-4" />
                      Batalkan
                    </Button>
                  }
                  variant="destructive"
                  title="Batalkan pembelian ini?"
                  description="Pembelian akan dibatalkan dan tidak dapat dikembalikan. Pastikan Anda yakin sebelum melanjutkan."
                  confirmText="Ya, batalkan pembelian"
                  cancelText="Kembali"
                  processingText="Membatalkan..."
                  icon={<ShieldAlert className="size-6" />}
                  isLoading={isUpdating}
                  disableCancelOnLoading={true}
                  onConfirm={() => {
                    updateStatus({ id: purchase.id, status: "CANCELED" });
                  }}
                  requireText="BATALKAN"
                />
              )}

              {canOngoing && (
                <Button
                  variant="outline"
                  disabled={isUpdating}
                  onClick={() =>
                    updateStatus({ id: purchase.id, status: "ONGOING" })
                  }
                >
                  <Truck className="size-4" />{" "}
                  {isUpdating ? "Mengupdate..." : "Set Berlangsung"}
                </Button>
              )}

              {canFinish && (
                <ConfirmActionDialog
                  trigger={
                    <Button variant={"outline"} disabled={isUpdating}>
                      <PackageCheck className="size-4" />
                      {isUpdating ? "Finishing..." : "Finish (Tambah Stok)"}
                    </Button>
                  }
                  title="Selesaikan pembelian & tambah stok?"
                  description="Aksi ini akan mengubah status menjadi FINISHED dan menambah stok raw material."
                  confirmText="Ya, selesai & tambah stok"
                  cancelText="Kembali"
                  icon={<CheckCircle2 className="size-6" />}
                  isLoading={isUpdating}
                  onConfirm={async () => {
                    updateStatus({ id: purchase.id, status: "FINISHED" });
                  }}
                />
              )}
            </>
          )}

          <Button
            variant={"outline"}
            disabled={isLocked}
            onClick={async (e) => {
              if (isLocked) e.preventDefault();

              await router.replace(
                `/purchases/accessories/${purchase.id}/edit`,
              );
              router.reload();
            }}
          >
            <SquarePen className="size-4" /> Edit
          </Button>
        </div>
      </div>

      <div className="bg-card rounded-2xl border p-6 shadow-sm">
        <h3 className="text-base font-semibold">Items (Bahan Baku)</h3>
        <p className="text-muted-foreground mt-1 text-sm">
          Daftar item aksesoris yang dibeli.
        </p>

        <div className="mt-4 space-y-2">
          {purchase.items.map((it) => (
            <div
              key={it.id}
              className="flex items-start justify-between gap-3 rounded-xl border p-4"
            >
              <div className="min-w-0">
                <p className="truncate font-medium">
                  {it.accessory?.name ?? "Aksesoris (deleted)"}
                </p>
                <p className="text-muted-foreground mt-1 text-sm">
                  Unit: {toRupiah(it.unitPrice)} • Subtotal:{" "}
                  {toRupiah(it.subtotal)}
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
