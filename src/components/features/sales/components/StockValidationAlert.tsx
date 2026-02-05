import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { AlertTriangle } from "lucide-react";

type StockValidationAlertProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productName: string;
  requestedQty: number;
  availableStock: number;
  onConfirm: () => void;
};

export function StockValidationAlert({
  open,
  onOpenChange,
  productName,
  requestedQty,
  availableStock,
  onConfirm,
}: StockValidationAlertProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <AlertDialogTitle>Stok Tidak Mencukupi</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2 pt-2">
            <p>
              Jumlah yang Anda masukkan melebihi stok yang tersedia untuk produk{" "}
              <span className="font-semibold">{productName}</span>.
            </p>
            <div className="bg-muted rounded-md p-3 text-sm">
              <div className="flex justify-between">
                <span>Jumlah diminta:</span>
                <span className="font-semibold text-red-600">
                  {requestedQty.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Stok tersedia:</span>
                <span className="font-semibold text-emerald-600">
                  {availableStock.toFixed(2)}
                </span>
              </div>
            </div>
            <p className="text-xs">
              Quantity akan disesuaikan secara otomatis ke jumlah stok yang
              tersedia.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogAction onClick={onConfirm}>
            OK, Sesuaikan Quantity
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
