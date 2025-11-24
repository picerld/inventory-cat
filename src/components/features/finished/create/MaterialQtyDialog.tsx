import type { RawMaterial } from "~/types/raw-material";
import { Package, TrendingDown, TrendingUp } from "lucide-react";

export const MaterialQtyDialog = ({
  qtyNotification,
}: {
  qtyNotification: { name: string; newQty: number; material: RawMaterial };
}) => {
  const remainingStock = qtyNotification.material.qty - qtyNotification.newQty;
  const isLowStock = remainingStock < 10;
  const stockPercentage = (remainingStock / qtyNotification.material.qty) * 100;

  return (
    <div className="animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 border-border bg-background fixed right-6 bottom-8 z-[9999] w-[320px] rounded-2xl border-2 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.15)] backdrop-blur-sm duration-300">
      <div className="mb-4 flex items-start gap-3">
        <div className="bg-primary/10 rounded-xl p-2.5">
          <Package className="text-primary h-5 w-5" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <div className="text-base leading-tight font-semibold">
            {qtyNotification.name}
          </div>
          <div className="text-muted-foreground mt-1 text-xs">
            Kuantiti digunakan:{" "}
            <span className="font-medium">{qtyNotification.newQty}</span>
          </div>
        </div>
      </div>

      <div className="bg-muted/50 mb-3 rounded-xl p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-muted-foreground text-xs font-medium">
            Stok Tersisa
          </span>
          <div className="flex items-center gap-1.5">
            {remainingStock > 0 ? (
              <TrendingDown className="h-3.5 w-3.5 text-orange-500" />
            ) : (
              <TrendingUp className="h-3.5 w-3.5 text-red-500" />
            )}
            <span
              className={`text-lg font-bold ${
                remainingStock > 0
                  ? isLowStock
                    ? "text-orange-600"
                    : "text-green-600"
                  : "text-red-600"
              }`}
            >
              {remainingStock}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="bg-muted mb-2 h-2 overflow-hidden rounded-full">
          <div
            className={`h-full transition-all duration-500 ${
              remainingStock > 0
                ? isLowStock
                  ? "bg-orange-500"
                  : "bg-green-500"
                : "bg-red-500"
            }`}
            style={{ width: `${Math.max(stockPercentage, 0)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Stok Awal: {qtyNotification.material.qty}
          </span>
          {isLowStock && remainingStock > 0 && (
            <span className="font-medium text-orange-600">⚠️ Stok Rendah</span>
          )}
          {remainingStock === 0 && (
            <span className="font-medium text-red-600">❌ Habis</span>
          )}
        </div>
      </div>

      <div className="bg-border my-3 h-px" />

      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Digunakan:</span>
          <span className="font-semibold">{qtyNotification.newQty} unit</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground">Tersisa:</span>
          <span
            className={`font-semibold ${
              remainingStock > 0
                ? isLowStock
                  ? "text-orange-600"
                  : "text-green-600"
                : "text-red-600"
            }`}
          >
            {remainingStock} unit
          </span>
        </div>
      </div>
    </div>
  );
};
