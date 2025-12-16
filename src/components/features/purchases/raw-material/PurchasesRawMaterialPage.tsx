import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { Wallet } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function PurchasesRawMaterialPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Bahan Baku" />
      <Header
        title="Pembelian Bahan Baku"
        subtitle="Manage your Pembelian Bahan Baku network and track performance"
      >
        <Button size={"icon-lg"} variant={"outline"}>
          <Wallet className="size-6" />
        </Button>
      </Header>
      Pembelian Bahan Baku
    </GuardedLayout>
  );
}
