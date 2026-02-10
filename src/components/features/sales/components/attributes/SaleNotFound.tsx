import { Package, RefreshCcw } from "lucide-react";
import { Button } from "~/components/ui/button";

export const SaleNotFound = ({ resetFilter }: { resetFilter: () => void }) => {
  return (
    <div className="bg-card space-y-3 rounded-2xl border p-12 text-center">
      <div className="mx-auto w-fit rounded-full bg-slate-100 p-4">
        <Package className="h-8 w-8 text-black" />
      </div>
      <div className="text-lg font-semibold">
        Data penjualan tidak ditemukan
      </div>
      <div className="text-muted-foreground mx-auto max-w-sm text-sm">
        Coba ganti kata kunci pencarian atau reset filter untuk melihat semua
        data.
      </div>
      <Button variant="outline" onClick={resetFilter} className="mt-4">
        <RefreshCcw className="mr-2 h-4 w-4" />
        Reset Filter
      </Button>
    </div>
  );
};
