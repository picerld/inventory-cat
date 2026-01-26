import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { Wallet } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function PurchaseAcccessoriesPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Aksesoris" />
      <Header
        title="Pembelian Aksesoris"
        subtitle="Manage your Pembelian Aksesoris network and track performance"
      >
        <Button size={"icon-lg"} variant={"outline"}>
          <Wallet className="size-6" />
        </Button>
      </Header>
      Pembelian Aksesoris
    </GuardedLayout>
  );
}
