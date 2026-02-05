import { AlertCircle, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";

export const SaleErrorsDialog = ({
  href,
  text,
}: {
  href?: string;
  text?: string;
}) => {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center">
      <div className="text-center">
        <div className="bg-destructive/10 mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full">
          <AlertCircle className="text-destructive h-10 w-10" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">Data Tidak Ditemukan</h2>
        <p className="text-muted-foreground mb-6">
          Penjualan yang Anda cari tidak tersedia atau telah dihapus
        </p>
        <Link
          href={href ?? "/dashboard"}
          className={buttonVariants({ variant: "default" })}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          {text ?? "Kembali"}
        </Link>
      </div>
    </div>
  );
};
