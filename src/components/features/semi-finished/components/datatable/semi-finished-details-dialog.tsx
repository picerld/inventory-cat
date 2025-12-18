"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import type { SemiFinishedGood } from "~/types/semi-finished-good";
import { Badge } from "~/components/ui/badge";
import { toRupiah } from "~/lib/utils";
import { Package, User, Calendar, Hash, Award } from "lucide-react";

type SemiFinishedGoodDetailsDialogProps = {
  currentRow: SemiFinishedGood | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function SemiFinishedGoodDetailsDialog({
  currentRow,
  open,
  onOpenChange,
}: SemiFinishedGoodDetailsDialogProps) {
  if (!currentRow) return null;

  const details = currentRow.SemiFinishedGoodDetail ?? [];
  const totalMaterials = details.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Detail Barang Setengah Jadi
          </DialogTitle>
          <DialogDescription className="text-base">
            Informasi lengkap tentang {currentRow.name}
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
                <User className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Dibuat Oleh</p>
                  <p className="font-medium">{currentRow.user?.name ?? "-"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
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
                <Hash className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Bahan Baku
                  </p>
                  <p className="font-medium">{totalMaterials} Bahan</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded-lg border border-dashed p-6">
              <Award className="mt-0.5 h-5 w-5" />
              <div>
                <p className="text-muted-foreground text-sm">Grade</p>
                <p className="font-medium">{currentRow.paintGrade?.name ?? "-"}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold">
              Daftar Bahan Baku
            </h3>

            {details.length === 0 ? (
              <div className="text-muted-foreground py-8 text-center">
                Tidak ada bahan baku yang terdaftar
              </div>
            ) : (
              <div className="space-y-3">
                {details.map((detail, index) => (
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
                        Harga Jual
                      </p>
                      <p className="font-medium">
                        {toRupiah(detail.rawMaterial.supplierPrice)}
                      </p>
                      <p className="text-muted-foreground mt-1 text-xs">
                        Total: Rp
                        {toRupiah(
                          detail.rawMaterial.supplierPrice * detail.qty,
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {details.length > 0 && (
            <div className="bg-muted/50 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-muted-foreground text-sm">
                    Total Nilai Bahan Baku
                  </p>
                  <p className="text-muted-foreground mt-1 text-xs">
                    (Berdasarkan harga supplier)
                  </p>
                </div>
                <p className="text-xl font-bold">
                  {toRupiah(
                    details.reduce(
                      (sum, detail) =>
                        sum + detail.rawMaterial.supplierPrice * detail.qty,
                      0,
                    ),
                  )}
                </p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
