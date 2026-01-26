import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChevronLeft, ChartNoAxesCombined } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { PurchaseRawMaterialForm } from "./components/PurchaseRawMaterialForm";

export default function PurchaseRawMaterialCreatePage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Pembelian Bahan Baku" />

      <Link
        href="/purchases/raw-materials"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>

      <Header
        title="Pembelian Bahan Baku"
        subtitle="Catat pembelian bahan baku dan update stok saat diposting"
      >
        <Button size={"icon-lg"} variant={"outline"}>
          <ChartNoAxesCombined className="size-6" />
        </Button>
      </Header>

      <PurchaseRawMaterialForm mode="create" />
    </GuardedLayout>
  );
}