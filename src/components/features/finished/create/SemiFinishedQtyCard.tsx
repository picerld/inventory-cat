import type { SemiFinishedGood } from "~/types/semi-finished-good";
import { X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

type SemiFinishedQtyCardProps = {
  semiFinished: SemiFinishedGood;
  qty: number;
  onRemove: (id: string) => void;
};

export const SemiFinishedQtyCard = ({
  semiFinished,
  qty,
  onRemove,
}: SemiFinishedQtyCardProps) => {
  if (!semiFinished) return null;

  const remainingStock = semiFinished.qty - qty;
  const isLowStock = remainingStock < 10;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base">
              {semiFinished.name}
            </CardTitle>
            <CardDescription className="mt-1">
              {semiFinished.paintGrade?.name}
            </CardDescription>
          </div>

          <Button
            variant={"outline"}
            size={"icon-sm"}
            type="button"
            onClick={() => onRemove(semiFinished.id)}
          >
            <X className="size-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{qty}</span>
            <span className="text-muted-foreground text-xs">
              barang digunakan
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Stok tersedia:{" "}
            <span className="font-medium">{semiFinished.qty}</span>
          </span>
          <span
            className={
              isLowStock && remainingStock > 0
                ? "font-medium text-orange-600"
                : ""
            }
          >
            Sisa: {remainingStock}
          </span>
        </div>
      </CardContent>
    </Card>
  );
};
