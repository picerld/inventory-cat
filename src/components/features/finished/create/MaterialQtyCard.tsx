import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import type { RawMaterial } from "~/types/raw-material";

export const MaterialQtyCard = ({
  material,
  m,
  materials,
  updateQty,
  removeMaterial,
}: {
  material: RawMaterial | undefined;
  m: { rawMaterialId: string; qty: number };
  materials: { rawMaterialId: string; qty: number }[];
  updateQty: (rawMaterialId: string, qty: number) => void;
  removeMaterial: (rawMaterialId: string) => void;
}) => {
  if (!material) return null;

  const maxStock = material.qty;

  return (
    <div className="flex items-center justify-between rounded-xl border p-4 shadow-sm">
      <div className="font-medium">{material.name}</div>

      <div className="flex items-center gap-2">
        <div className="bg-muted/40 flex items-center gap-1 rounded-lg border px-2 py-1">
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => {
              const current = m.qty;
              const next = Math.max(1, current - 1);
              updateQty(m.rawMaterialId, next);
            }}
          >
            –
          </Button>

          <Input
            type="number"
            min={1}
            max={maxStock}
            value={m.qty}
            onChange={(e) => {
              let value = Number(e.target.value);

              if (isNaN(value)) return;

              if (value < 1) value = 1;

              if (value > maxStock) value = maxStock;

              updateQty(m.rawMaterialId, value);
            }}
            className="bg-muted/40 w-12 border-none text-center shadow-none"
          />

          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="h-6 w-6"
            onClick={() => {
              const current = m.qty;
              const next = Math.min(maxStock, current + 1);
              updateQty(m.rawMaterialId, next);
            }}
          >
            +
          </Button>
        </div>

        <Button
          size="icon"
          variant="ghost"
          onClick={() => removeMaterial(m.rawMaterialId)}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};
