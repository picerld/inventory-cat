import Link from "next/link";
import { Button } from "~/components/ui/button";

export const PurchaseNotFound = ({
  text,
  href,
  resetFilter,
}: {
  text?: string;
  href?: string;
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
          <Link href={href ?? "/purchase/raw-materials/create"}>
            {text ?? "Buat Data Pembelian Baru"}
          </Link>
        </Button>
      </div>
    </div>
  );
};
