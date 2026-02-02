import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import PurchaseAccessoriesCards from "./components/PurchaseAccessoriesCards";
import { ChartNoAxesCombined, Plus } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";

export default function PurchaseAccessoriesPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Pembelian Accessories" />

      <Header
        title="Pembelian Accessories"
        subtitle="Catat pembelian accessories dan update stok saat diposting"
      >
        <div className="flex gap-2">
          <Link
            href="/purchases/accessories/create"
            className={buttonVariants({
              variant: "outline",
              className: "mb-4",
              size: "lg",
            })}
          >
            <Plus className="h-4 w-4" />
            Tambah Pembelian Accessories
          </Link>

          <Button size={"icon-lg"} variant={"outline"}>
            <ChartNoAxesCombined className="size-6" />
          </Button>
        </div>
      </Header>

      <PurchaseAccessoriesCards />
    </GuardedLayout>
  );
}
