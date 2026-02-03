import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { SaleFinishedGoodCashierForm } from "~/components/features/sales/finished-good/components/SaleFinishedGoodCashierForm";

export default function SaleFinishedGoodCashierPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Kasir - Penjualan Barang Jadi" />

      <Link
        href="/sales/finished-goods"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>

      <Header
        title="Kasir - Penjualan Barang Jadi"
        subtitle="Scan barcode → masuk cart → simpan draft atau checkout (FINISHED)"
      />

      <SaleFinishedGoodCashierForm />
    </GuardedLayout>
  );
}
