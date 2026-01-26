import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import PurchaseRawMaterialCards from "./components/PurchaseRawMaterialCard";
import { ChartNoAxesCombined, Plus } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";

export default function PurchaseRawMaterialPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Pembelian Bahan Baku" />

      <Header
        title="Pembelian Bahan Baku"
        subtitle="Catat pembelian bahan baku dan update stok saat diposting"
      >
        <div className="flex gap-2">
          <Link
            href="/purchases/raw-materials/create"
            className={buttonVariants({
              variant: "outline",
              className: "mb-4",
              size: "lg"
            })}
          >
            <Plus className="h-4 w-4" />
            Tambah Pembelian Bahan Baku
          </Link>

          <Button size={"icon-lg"} variant={"outline"}>
            <ChartNoAxesCombined className="size-6" />
          </Button>
        </div>
      </Header>

      <PurchaseRawMaterialCards />
    </GuardedLayout>
  );
}
