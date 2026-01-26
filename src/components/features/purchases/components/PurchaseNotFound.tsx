import Link from "next/link";
import { Button } from "~/components/ui/button";

export const PurchaseNotFound = ({
  resetFilter,
}: {
  resetFilter: () => void;
}) => {
  return (
    <div className="rounded-xl border p-6">
      <p className="text-sm font-medium">Tidak ada data ditemukan.</p>
      <p className="text-muted-foreground mt-1 text-sm">
        Coba ubah kata kunci pencarian atau status.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button variant="outline" onClick={resetFilter}>
          Reset Filter
        </Button>
        <Button asChild>
          <Link href="/purchases/raw-materials/create">
            Buat Pembelian Baru
          </Link>
        </Button>
      </div>
    </div>
  );
};
