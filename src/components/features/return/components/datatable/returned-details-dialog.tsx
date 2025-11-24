"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Calendar, User, Package, Hash } from "lucide-react";
import type { ReturnGood } from "~/types/return-good";

type ReturnedGoodDetailsDialogProps = {
  currentRow: ReturnGood | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function ReturnedGoodDetailsDialog({
  currentRow,
  open,
  onOpenChange,
}: ReturnedGoodDetailsDialogProps) {
  if (!currentRow) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Detail Barang yang Dikembalikan
          </DialogTitle>
          <DialogDescription className="text-base">
            Informasi lengkap pengembalian dari {currentRow.user.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <h3 className="border-b pb-2 text-lg font-semibold">
              Informasi Umum
            </h3>

            <div className="grid grid-cols-1 gap-2">
              <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
                <User className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Dikembalikan oleh
                  </p>
                  <p className="font-medium">{currentRow.user.name}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
                <Package className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Barang</p>
                  <p className="font-medium">{currentRow.finishedGood.name}</p>
                </div>
              </div>

              {/* Qty */}
              <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
                <Hash className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Jumlah Dikembalikan
                  </p>
                  <p className="font-medium">{currentRow.qty} unit</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
                <Package className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">
                    Dari Bagian / Keperluan
                  </p>
                  <p className="font-medium">{currentRow.from}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-lg border border-dashed p-4">
                <Calendar className="mt-0.5 h-5 w-5" />
                <div>
                  <p className="text-muted-foreground text-sm">Tanggal</p>
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
            </div>
          </div>

          {currentRow.description && (
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-semibold">Deskripsi</h3>
              <p className="text-muted-foreground whitespace-pre-wrap">
                {currentRow.description}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
