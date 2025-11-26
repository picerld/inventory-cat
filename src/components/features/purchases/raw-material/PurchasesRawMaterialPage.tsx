import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { Button } from "~/components/ui/button";
import { Wallet } from "lucide-react";

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

      </GuardedLayout>
  );
}
