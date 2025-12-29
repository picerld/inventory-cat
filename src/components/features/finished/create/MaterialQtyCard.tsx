import type { RawMaterial } from "~/types/raw-material";
import { X, Edit3, Lock } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type MaterialQtyCardProps = {
  material: RawMaterial;
  m: { rawMaterialId: string; qty: number | string };
  materials: { rawMaterialId: string; qty: number | string }[];
  onOpenModal?: () => void;
  removeMaterial: (id: string) => void;
  readOnly?: boolean;
};

export const MaterialQtyCard = ({
  material,
  m,
  onOpenModal,
  removeMaterial,
  readOnly = false,
}: MaterialQtyCardProps) => {
  if (!material) return null;

  const materialQty = Number(material.qty);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">
              {material.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {material.supplier.name}
            </CardDescription>
          </div>

          <Button
            variant={"outline"}
            size={"icon-sm"}
            type="button"
            onClick={() => removeMaterial(m.rawMaterialId)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">
              {typeof m.qty === "number" ? m.qty.toFixed(2) : m.qty}
            </span>
            <span className="text-muted-foreground text-xs">
              barang digunakan
            </span>
          </div>

          {!readOnly && onOpenModal ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onOpenModal}
              className="gap-2"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Ubah
            </Button>
          ) : (
            <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
              <Lock className="h-3 w-3" />
              <span>Auto</span>
            </div>
          )}
        </div>

        <div className="flex items-center text-xs">
          <span className="text-muted-foreground">
            Stok tersedia:{" "}
            <span className="font-medium">{materialQty.toFixed(2)}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
