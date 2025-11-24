import {
  Calendar,
  Hash,
  Package,
  Scale,
  User,
  Wallet,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { toRupiah } from "../../../../../lib/utils";
import type { PainAccessories } from "~/types/paint-accessories";

type AcessoriesDialogProps = {
  currentRow: PainAccessories | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function AccessoriesDetailsDialog({
  currentRow,
  onOpenChange,
  open,
}: AcessoriesDialogProps) {
  if (!currentRow) return null;

  const buckets = Array.from({ length: currentRow.qty }, (_, i) => i);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex text-2xl font-bold">
            Aksesoris {currentRow.name} ({currentRow.qty} barang)
          </DialogTitle>
          <DialogDescription className="text-base">
            Informasi lengkap tentang bahan baku "{currentRow.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold">
              Informasi Umum
            </h3>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <Package className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Nama Barang</p>
                  <p className="font-medium">{currentRow.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <Hash className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Nama Supplier</p>
                  <p className="font-medium">{currentRow.supplier.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <Scale className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Kuantiti</p>
                  <p className="font-medium">{currentRow.qty}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <User className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Dibuat Oleh</p>
                  <p className="font-medium">{currentRow.user?.name ?? "-"}</p>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 rounded-lg border border-dashed p-6">
                <Calendar className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Tanggal Dibuat
                  </p>
                  <p className="font-medium">
                    {new Date(currentRow.createdAt).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      },
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <User className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Harga Supplier
                  </p>
                  <p className="font-medium">
                    {toRupiah(currentRow.supplierPrice)}/barang
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <User className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Harga Jual</p>
                  <p className="font-medium">
                    {toRupiah(currentRow.sellingPrice)}/barang
                  </p>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 rounded-lg border border-dashed p-6">
                <Wallet className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Harga Supplier Keseluruhan
                  </p>
                  <p className="font-medium">
                    {toRupiah(currentRow.qty * currentRow.supplierPrice)} total
                  </p>
                </div>
              </div>

              <div className="col-span-2 flex items-center gap-3 rounded-lg border border-dashed p-6">
                <Wallet className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Harga Jual Keseluruhan
                  </p>
                  <p className="font-medium">
                    {toRupiah(currentRow.qty * currentRow.sellingPrice)} total
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
