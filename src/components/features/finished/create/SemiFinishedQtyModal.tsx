import React, { useState } from "react";
import {
  Package,
  Minus,
  Plus,
  X,
  TrendingDown,
  AlertTriangle,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import type { SemiFinishedGood } from "~/types/semi-finished-good";

type SemiFinishedQtyModalProps = {
  semiFinished: SemiFinishedGood;
  currentQty: number;
  onConfirm: (qty: number) => void;
  onClose: () => void;
};

export const SemiFinishedQtyModal = ({
  semiFinished,
  currentQty,
  onConfirm,
  onClose,
}: SemiFinishedQtyModalProps) => {
  const [qty, setQty] = useState(currentQty.toString());

  const numericQty = Number(qty) || 0;

  const remainingStock = semiFinished.qty - numericQty;
  const isLowStock = remainingStock < 10 && remainingStock > 0;
  const stockPercentage = Math.max((remainingStock / semiFinished.qty) * 100, 0);

  const handleIncrement = () => {
    const next = numericQty + 1;
    if (next <= semiFinished.qty) setQty(next.toString());
  };

  const handleDecrement = () => {
    const next = numericQty - 1;
    if (next >= 1) setQty(next.toString());
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!/^\d*$/.test(value)) return;

    const numeric = Number(value);

    if (value === "") {
      setQty("");
      return;
    }

    if (numeric > semiFinished.qty) {
      setQty(semiFinished.qty.toString());
    } else if (numeric < 1) {
      setQty("1");
    } else {
      setQty(value);
    }
  };

  const handleConfirm = () => {
    const finalQty = Number(qty);

    if (finalQty >= 1 && finalQty <= semiFinished.qty) {
      onConfirm(finalQty);
      onClose();
    } else {
      toast.error(`Jumlah harus antara 1 dan ${semiFinished.qty}.`);

      setQty(semiFinished.qty.toString());
    }
  };

  return (
    <>
      <div
        className="animate-in fade-in-0 fixed inset-0 z-50 bg-black/50 backdrop-blur-sm duration-200"
        onClick={onClose}
      />

      <div className="animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4 fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 duration-200">
        <div className="bg-background border-border mx-4 rounded-2xl border-2 shadow-2xl">
          <div className="border-border flex items-start justify-between border-b p-6 pb-4">
            <div className="flex w-full items-start gap-3">
              <div className="bg-primary/10 rounded-xl p-2.5">
                <Package className="text-primary h-6 w-6" strokeWidth={2.5} />
              </div>
              <div className="w-full">
                <h3 className="text-lg leading-tight font-semibold">
                  {semiFinished.name}
                </h3>
                <div className="flex w-full justify-between">
                  <p className="text-muted-foreground mt-1 text-sm">
                    {semiFinished.paintGrade.name}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground -mt-2 -mr-2 rounded-lg p-2 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-5 p-6">
            {/* Stock Bar */}
            <div className="bg-muted/50 rounded-xl p-4">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-muted-foreground text-sm font-medium">
                  Stok Tersedia
                </span>
                <span className="text-2xl font-bold">
                  {semiFinished.qty}{" "}
                  <span className="text-foreground text-base">barang</span>
                </span>
              </div>

              <div className="bg-muted mb-2 h-2.5 overflow-hidden rounded-full">
                <div
                  className={`h-full transition-all duration-300 ${
                    remainingStock > 0
                      ? isLowStock
                        ? "bg-orange-500"
                        : "bg-green-500"
                      : "bg-red-500"
                  }`}
                  style={{ width: `${stockPercentage}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  Sisa setelah digunakan:{" "}
                  <span
                    className={`font-semibold ${
                      remainingStock > 0
                        ? isLowStock
                          ? "text-orange-600"
                          : "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {remainingStock} barang
                  </span>
                </span>
              </div>
            </div>

            <div>
              <label className="mb-3 block text-sm font-medium">
                Jumlah Penggunaan
              </label>
              <div className="flex items-center gap-3">
                <Button
                  size={"lg"}
                  onClick={handleDecrement}
                  disabled={numericQty <= 1}
                  className="bg-muted hover:bg-muted/80 text-primary rounded-xl py-7"
                >
                  <Minus className="size-5" strokeWidth={3} />
                </Button>

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={qty}
                    onChange={handleInputChange}
                    className="border-border focus:ring-primary h-14 w-full rounded-xl border-2 bg-transparent text-center text-2xl font-bold focus:ring-2 focus:ring-offset-2 focus:outline-none"
                  />
                  <span className="text-muted-foreground absolute top-1/2 right-4 -translate-y-1/2 text-sm">
                    barang
                  </span>
                </div>

                <Button
                  size={"lg"}
                  onClick={handleIncrement}
                  disabled={numericQty >= semiFinished.qty}
                  className="bg-muted hover:bg-muted/80 text-primary rounded-xl py-7"
                >
                  <Plus className="size-5" strokeWidth={3} />
                </Button>
              </div>
            </div>

            {isLowStock && remainingStock > 0 && (
              <div className="flex items-start gap-3 rounded-xl bg-orange-50 p-3 dark:bg-orange-950/20">
                <AlertTriangle className="mt-0.5 h-5 w-5 text-orange-600 dark:text-orange-500" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-orange-900 dark:text-orange-100">
                    Stok Rendah
                  </p>
                  <p className="mt-1 text-orange-700 dark:text-orange-300">
                    Stok tersisa hanya {remainingStock} barang setelah
                    penggunaan.
                  </p>
                </div>
              </div>
            )}

            {remainingStock === 0 && (
              <div className="flex items-start gap-3 rounded-xl bg-red-50 p-3 dark:bg-red-950/20">
                <TrendingDown className="mt-0.5 h-5 w-5 text-red-600 dark:text-red-500" />
                <div className="flex-1 text-sm">
                  <p className="font-medium text-red-900 dark:text-red-100">
                    Stok Habis
                  </p>
                  <p className="mt-1 text-red-700 dark:text-red-300">
                    Penggunaan ini akan menghabiskan seluruh stok.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="border-border flex items-center justify-end gap-3 border-t p-6 pt-4">
            <button
              onClick={onClose}
              className="bg-muted w-1/2 cursor-pointer rounded-xl px-6 py-2.5 font-medium transition-colors"
            >
              Batal
            </button>
            <button
              onClick={handleConfirm}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-1/2 cursor-pointer rounded-xl px-6 py-2.5 font-medium transition-colors"
            >
              Konfirmasi
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
