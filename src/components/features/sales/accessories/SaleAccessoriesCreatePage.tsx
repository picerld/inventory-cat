import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChevronLeft, ChartNoAxesCombined } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { SaleAccessoriesForm } from "./components/SaleAccessoriesForm";

export default function SaleAccessoriesCreatePage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Penjualan Barang Jadi" />
      <Link
        href="/sales/accessories"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>

      <SaleAccessoriesForm mode="create" />
    </GuardedLayout>
  );
}
