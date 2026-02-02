import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import Link from "next/link";
import { buttonVariants } from "~/components/ui/button";
import { ChevronLeft } from "lucide-react";
import PurchaseAccessoriesDetail from "~/components/features/purchases/accessories/detail/PurchaseAccessoriesDetail";

export default function PurchaseAccessoriesDetailPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Detail Pembelian Accessories" />

      <Link
        href="/purchases/accessories"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" />
        Kembali
      </Link>

      <Header
        title="Detail Pembelian Accessories"
        subtitle="Informasi transaksi & item accessories"
      />

      <PurchaseAccessoriesDetail />
    </GuardedLayout>
  );
}
