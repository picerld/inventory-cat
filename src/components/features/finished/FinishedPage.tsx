import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChartNoAxesCombined } from "lucide-react";
import { Button } from "~/components/ui/button";
import { FinishedGoodsProvider } from "./components/datatable/finished-provider";
import { FinishedGoodsTable } from "./components/datatable/finished-table";
import { FinishedGoodsDialogs } from "./components/datatable/finished-dialog";
import { FinishedGoodStatsContainer } from "./components/FinishedGoodStatsContainer";

export default function FinishedPage() {
  return (
    <FinishedGoodsProvider>
    <GuardedLayout>
      <HeadMetaData title="Barang Jadi" />
      <Header
        title="Barang Jadi"
        subtitle="Manage your Barang Jadi network and track performance"
      >
        <Button size={"icon-lg"} variant={"outline"}>
          <ChartNoAxesCombined className="size-6" />
        </Button>
      </Header>

      <FinishedGoodStatsContainer />

      <FinishedGoodsTable />

      <FinishedGoodsDialogs />
    </GuardedLayout>
    </FinishedGoodsProvider>
  );
}
