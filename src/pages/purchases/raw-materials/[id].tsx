import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";
import PurchaseRawMaterialDetail from "~/components/features/purchases/raw-material/detail/PurchaseRawMaterialDetail";

export default function PurchaseRawMaterialDetailPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Detail Pembelian Bahan Baku" />

      <Link
        href="/purchases/raw-materials"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Kembali
      </Link>

      <Header
        title="Detail Pembelian Bahan Baku"
        subtitle="Informasi transaksi & item bahan baku"
      />

      <PurchaseRawMaterialDetail />
    </GuardedLayout>
  );
}
