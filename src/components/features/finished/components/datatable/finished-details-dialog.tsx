
"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Badge } from "~/components/ui/badge";
import {
  Package,
  User,
  Hash,
  FileText,
  Award,
  CalendarClock,
  Layers,
} from "lucide-react";
import type { FinishedGood } from "~/types/finished-good";

type FinishedGoodDetailsDialogProps = {
  currentRow: FinishedGood | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

// Mock utility function
const toRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(amount);
};

export function FinishedGoodDetailsDialog({
  currentRow,
  open,
  onOpenChange,
}: FinishedGoodDetailsDialogProps) {
  if (!currentRow) return null;

  const details = currentRow.finishedGoodDetails ?? [];
  const totalMaterials = details.length;
  
  // Separate raw materials and semi-finished goods
  const rawMaterialDetails = details.filter(d => !d.semiFinishedGood);
  const semiFinishedDetails = details.filter(d => d.semiFinishedGood);

  // Calculate total value (only from raw materials with price)
  const totalValue = details.reduce((sum, detail) => {
    if (!detail.semiFinishedGood && detail.rawMaterial.supplierPrice > 0) {
      return sum + detail.rawMaterial.supplierPrice * detail.qty;
    }
    return sum;
  }, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Detail Barang Jadi
          </DialogTitle>
          <DialogDescription className="text-base">
            Informasi lengkap tentang {currentRow.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* General Information */}
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
                <Award className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Kualitas</p>
                  <Badge variant="success">{currentRow.paintGrade.name}</Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <Package className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Jumlah Produksi
                  </p>
                  <p className="font-medium">{currentRow.qty} Barang</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <CalendarClock className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Tanggal Produksi
                  </p>
                  <p className="font-medium">
                    {new Date(currentRow.dateProduced).toLocaleDateString(
                      "id-ID",
                      {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                      }
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <FileText className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Kode Produksi</p>
                  <p className="font-medium">{currentRow.productionCode}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <Hash className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Nomor Batch</p>
                  <p className="font-medium">{currentRow.batchNumber}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <Layers className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Tipe Sumber</p>
                  <Badge variant={currentRow.sourceType === "RAW_MATERIAL" ? "default" : "secondary"}>
                    {currentRow.sourceType === "RAW_MATERIAL" ? "Bahan Baku" : "Setengah Jadi"}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
                <User className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Dibuat Oleh</p>
                  <p className="font-medium">{currentRow.user?.name ?? "-"}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Semi-Finished Goods Section */}
          {semiFinishedDetails.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold">Barang Setengah Jadi</h3>
                <Badge variant="outline" className="text-sm">
                  {semiFinishedDetails.length} Item
                </Badge>
              </div>

              <div className="space-y-3">
                {semiFinishedDetails.map((detail, index) => (
                  <div
                    key={detail.id}
                    className="flex items-center justify-between rounded-lg border border-blue-200 bg-blue-50 p-4 transition-colors dark:border-blue-800 dark:bg-blue-950/20"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900"
                      >
                        <Layers className="h-4 w-4" />
                      </Badge>
                      <div>
                        <p className="font-medium">{detail.semiFinishedGood.name}</p>
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <span>Digunakan: {detail.qty} unit</span>
                          <span>•</span>
                          <span>
                            Stok tersisa: {detail.semiFinishedGood.qty} unit
                          </span>
                          <span>•</span>
                          <span className="text-xs">
                            Grade: {detail.semiFinishedGood.paintGrade.name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Raw Materials Section */}
          {rawMaterialDetails.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2">
                <h3 className="text-lg font-semibold">Daftar Bahan Baku</h3>
                <Badge variant="outline" className="text-sm">
                  {rawMaterialDetails.length} Bahan
                </Badge>
              </div>

              <div className="space-y-3">
                {rawMaterialDetails.map((detail, index) => (
                  <div
                    key={detail.id}
                    className="bg-card hover:bg-accent/50 flex items-center justify-between rounded-lg border p-4 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <Badge
                        variant="outline"
                        className="flex h-8 w-8 items-center justify-center rounded-full"
                      >
                        {index + 1}
                      </Badge>
                      <div>
                        <p className="font-medium">{detail.rawMaterial.name}</p>
                        <div className="text-muted-foreground flex items-center gap-2 text-sm">
                          <span>Digunakan: {detail.qty} unit</span>
                          <span>•</span>
                          <span>
                            Stok tersisa: {detail.rawMaterial.qty} unit
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-muted-foreground text-sm">
                        Harga Supplier
                      </p>
                      <p className="font-medium">
                        {toRupiah(detail.rawMaterial.supplierPrice)}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Total:{" "}
                        {toRupiah(detail.rawMaterial.supplierPrice * detail.qty)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {details.length === 0 && (
            <div className="text-muted-foreground py-8 text-center">
              Tidak ada bahan yang terdaftar
            </div>
          )}

          {/* Total Value Summary */}
          {totalValue > 0 && (
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Nilai Bahan Baku
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    (Berdasarkan harga supplier, tidak termasuk barang setengah jadi)
                  </p>
                </div>
                <p className="text-xl font-bold">
                  {toRupiah(totalValue)}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}