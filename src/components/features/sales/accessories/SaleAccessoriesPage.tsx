import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChartNoAxesCombined, Plus } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import SaleAccessoriesListContainer from "./components/SaleAccessoriesListContainer";

export default function SaleAccessoriesPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Penjualan Aksesoris" />
      <Header
        title="Penjualan Aksesoris"
        subtitle="Catat penjualan aksesoris dan update stok saat diposting"
      >
        <div className="flex gap-2">
          <Link
            href="/sales/accessories/create"
            className={buttonVariants({
              variant: "outline",
              className: "mb-4",
              size: "lg",
            })}
          >
            <Plus className="h-4 w-4" />
            Tambah Penjualan Aksesoris
          </Link>

          <Button size={"icon-lg"} variant={"outline"}>
            <ChartNoAxesCombined className="size-6" />
          </Button>
        </div>
      </Header>

      <SaleAccessoriesListContainer />
    </GuardedLayout>
  );
}
