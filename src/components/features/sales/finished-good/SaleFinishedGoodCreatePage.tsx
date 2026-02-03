import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChevronLeft, ChartNoAxesCombined } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { SaleFinishedGoodForm } from "./components/SaleFinishedGoodForm";

export default function SaleFinishedGoodCreatePage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Penjualan Barang Jadi" />
      <Link
        href="/sales/finished-goods"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>

      <SaleFinishedGoodForm mode="create" />
    </GuardedLayout>
  );
}
