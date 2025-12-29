import {
  X,
  Minus,
  Plus,
  Package,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Warehouse,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { Progress } from "~/components/ui/progress";
import type { RawMaterial } from "~/types/raw-material";
import { useState, useEffect } from "react";

type MaterialCardProps = {
  isEdit: boolean;
  m: { rawMaterialId: string; qty: number | string };
  material: RawMaterial | undefined;
  materials: { rawMaterialId: string; qty: number | string }[];
  updateQty: (rawMaterialId: string, qty: number | string) => void;
  removeMaterial: (rawMaterialId: string) => void;
};

export const MaterialQtyCard = ({
  m,
  isEdit,
  material,
  materials,
  updateQty,
  removeMaterial,
}: MaterialCardProps) => {
  const [oldQty, setOldQty] = useState(m.qty);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (m.qty !== oldQty && oldQty !== m.qty) {
      setShowNotification(true);
      const timer = setTimeout(() => {
        setShowNotification(false);
        setOldQty(m.qty);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [m.qty, oldQty]);

  if (!material) return null;

  const maxStock = Number(material.qty);
  const currentQty = typeof m.qty === "string" ? parseFloat(m.qty) || 0 : m.qty;
  const stockPercentage = (currentQty / maxStock) * 100;
  const remainingStock = maxStock - currentQty;
  const oldQtyNum =
    typeof oldQty === "string" ? parseFloat(oldQty) || 0 : oldQty;
  const isIncreasing = currentQty > oldQtyNum;
  const remainingPercentage = (remainingStock / maxStock) * 100;
  const stockStatus =
    remainingPercentage > 30
      ? "healthy"
      : remainingPercentage > 0
        ? "low"
        : "critical";

  return (
    <div className="relative">
      <div className="group border-border bg-card hover:border-primary/50 relative overflow-hidden rounded-xl border-2 transition-all duration-200 hover:shadow-md">
        <div className="bg-muted absolute inset-x-0 top-0 h-1">
          <div
            className="from-primary/60 to-primary h-full bg-gradient-to-r transition-all duration-300"
            style={{ width: `${stockPercentage}%` }}
          />
        </div>

        <div className="flex items-center gap-3 p-4 pt-5">
          <div className="bg-primary/10 text-primary flex h-10 w-10 shrink-0 items-center justify-center rounded-lg">
            <Package className="h-5 w-5" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="text-foreground truncate font-semibold">
              {material.name}
            </div>
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <span className="truncate">{material.supplier?.name}</span>
            </div>
            <div className="text-muted-foreground mt-1 text-xs">
              Stok:{" "}
              <span className="text-foreground font-medium">
                {Number(material.qty).toFixed(2)}
              </span>{" "}
              unit
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <div className="border-border bg-muted/30 flex items-center gap-1 rounded-lg border-2 p-1">
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="hover:bg-background hover:text-primary h-8 w-8 rounded-md"
                onClick={() => {
                  const current = currentQty;
                  const next = Math.max(0.1, current - 0.1);
                  updateQty(m.rawMaterialId, Math.round(next * 10) / 10);
                }}
                disabled={currentQty <= 0.1 || isEdit}
              >
                <Minus className="h-4 w-4" />
              </Button>

              <Input
                type="text"
                value={m.qty}
                onChange={(e) => {
                  const value = e.target.value;

                  // Allow decimal input
                  if (!/^\d*\.?\d*$/.test(value)) return;

                  updateQty(m.rawMaterialId, value);
                }}
                onBlur={(e) => {
                  const value = e.target.value;

                  // On blur, validate and set to minimum if invalid
                  if (value === "" || value === ".") {
                    updateQty(m.rawMaterialId, 0.1);
                    return;
                  }

                  const num = parseFloat(value);
                  if (isNaN(num) || num <= 0) {
                    updateQty(m.rawMaterialId, 0.1);
                  } else if (num > maxStock) {
                    updateQty(m.rawMaterialId, maxStock);
                  }
                }}
                readOnly={isEdit}
                disabled={isEdit}
                className="h-8 w-16 border-none bg-transparent text-center font-semibold"
              />

              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="hover:bg-background hover:text-primary h-8 w-8 rounded-md"
                onClick={() => {
                  const current = currentQty;
                  const next = Math.min(maxStock, current + 0.1);
                  updateQty(m.rawMaterialId, Math.round(next * 10) / 10);
                }}
                disabled={currentQty >= maxStock || isEdit}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9 rounded-lg transition-colors"
              onClick={() => removeMaterial(m.rawMaterialId)}
              disabled={isEdit}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {showNotification && (
        <div className="animate-in fade-in-0 slide-in-from-top-2 border-border bg-card mt-2 overflow-hidden rounded-xl border-2 shadow-lg duration-200">
          <div className="bg-muted/30 flex items-start gap-3 border-b p-3">
            <div className="bg-primary/10 text-primary ring-primary/20 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ring-2">
              <CheckCircle2 className="h-4 w-4" />
            </div>

            <div className="flex-1">
              <Badge variant="secondary" className="mb-1 text-xs font-medium">
                Updated
              </Badge>
              <div className="text-foreground text-sm font-bold">
                {material.name}
              </div>
            </div>

            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive h-9 w-9 rounded-lg transition-colors"
              onClick={() => setShowNotification(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="space-y-3 p-3">
            <div className="bg-muted/40 flex items-center justify-between rounded-lg border p-2">
              <div className="flex items-center gap-2">
                {isIncreasing ? (
                  <TrendingUp className="h-4 w-4 text-blue-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-orange-500" />
                )}
                <span className="text-xs font-medium">Kuantiti</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-xs">
                  {typeof oldQty === "number" ? oldQty.toFixed(2) : oldQty}
                </span>
                <span className="text-muted-foreground text-xs">→</span>
                <span className="text-sm font-bold">
                  {typeof m.qty === "number" ? m.qty.toFixed(2) : m.qty}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                  <Warehouse className="h-3.5 w-3.5" />
                  <span>Stok Tersisa</span>
                </div>
                <Badge
                  variant={
                    stockStatus === "healthy"
                      ? "default"
                      : stockStatus === "low"
                        ? "secondary"
                        : "destructive"
                  }
                  className="text-xs font-bold"
                >
                  {remainingStock.toFixed(2)} unit
                </Badge>
              </div>

              <div className="space-y-1">
                <Progress
                  value={Math.max(0, Math.min(100, remainingPercentage))}
                  className={`h-1.5 ${
                    stockStatus === "healthy"
                      ? "[&>div]:bg-green-500"
                      : stockStatus === "low"
                        ? "[&>div]:bg-orange-500"
                        : "[&>div]:bg-red-500"
                  }`}
                />
                <div className="text-muted-foreground flex justify-between text-[10px]">
                  <span>
                    Terpakai:{" "}
                    {typeof m.qty === "number" ? m.qty.toFixed(2) : m.qty}
                  </span>
                  <span>Total: {Number(material.qty).toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
