import type { RawMaterial } from "~/types/raw-material";

export const MaterialQtyDialog = ({
  qtyNotification,
}: {
  qtyNotification: { name: string; newQty: number; material: RawMaterial };
}) => {
  return (
    <div className="animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 border-secondary bg-secondary fixed right-6 bottom-8 z-[9999] w-[280px] rounded-2xl border p-4 shadow-[0_8px_30px_rgba(0,0,0,0.12)] duration-200">
      <div className="text-base font-semibold">{qtyNotification.name}</div>

      <div className="text-muted-foreground mb-2 text-sm">
        Kuantiti: {qtyNotification.newQty} (
        <span
          className={
            qtyNotification.material.qty - qtyNotification.newQty > 0
              ? "text-green-600"
              : "text-red-600"
          }
        >
          {qtyNotification.material.qty - qtyNotification.newQty})
        </span>
      </div>

      <div className="space-y-1 text-sm">
        <div className="flex justify-between">
          <span>Stok di Gudang:</span>
          <span className="font-medium">{qtyNotification.material.qty}</span>
        </div>
      </div>
    </div>
  );
};
