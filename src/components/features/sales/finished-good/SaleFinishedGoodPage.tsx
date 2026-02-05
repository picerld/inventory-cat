import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChartNoAxesCombined, Plus } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import SaleFinishedGoodListContainer from "./components/SaleFinishedGoodListContainer";

export default function SaleFinishedGoodPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Penjualan Barang Jadi" />
      <Header
        title="Penjualan Barang Jadi"
        subtitle="Catat pembelian barang jadi dan update stok saat diposting"
      >
        <div className="flex gap-2">
          <Link
            href="/sales/finished-goods/create"
            className={buttonVariants({
              variant: "outline",
              className: "mb-4",
              size: "lg",
            })}
          >
            <Plus className="h-4 w-4" />
            Tambah Penjualan Barang Jadi
          </Link>

          <Button size={"icon-lg"} variant={"outline"}>
            <ChartNoAxesCombined className="size-6" />
          </Button>
        </div>
      </Header>
      
      <SaleFinishedGoodListContainer />
    </GuardedLayout>
  );
}
