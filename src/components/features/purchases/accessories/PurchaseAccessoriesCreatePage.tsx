import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChevronLeft, ChartNoAxesCombined } from "lucide-react";
import { Button, buttonVariants } from "~/components/ui/button";
import Link from "next/link";
import { PurchaseAccessoriesForm } from "./components/PurchaseAccessoriesForm";

export default function PurchaseAccessoriesCreatePage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Pembelian Accessories" />

      <Link
        href="/purchases/accessories"
        className={buttonVariants({ variant: "outline", className: "mb-4" })}
      >
        <ChevronLeft className="mr-2 h-4 w-4" /> Kembali
      </Link>

      <Header
        title="Pembelian Accessories"
        subtitle="Catat pembelian accessories dan update stok saat diposting"
      >
        <Button size={"icon-lg"} variant={"outline"}>
          <ChartNoAxesCombined className="size-6" />
        </Button>
      </Header>

      <PurchaseAccessoriesForm mode="create" />
    </GuardedLayout>
  );
}
