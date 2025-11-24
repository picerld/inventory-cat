import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { ChartColumnDecreasing } from "lucide-react";
import { Button } from "~/components/ui/button";
import { ReturnedGoodsProvider } from "./components/datatable/returned-provider";
import ReturnedGoodStatsContainer from "./components/ReturnedStatsContainer";
import { ReturnedGoodsTable } from "./components/datatable/returned-table";
import { ReturnedGoodsDialogs } from "./components/datatable/returned-dialog";

export default function ReturnedPage() {
  return (
    <ReturnedGoodsProvider>
    <GuardedLayout>
      <HeadMetaData title="Barang Retur" />
      <Header
        title="Barang Retur"
        subtitle="Manage your Bahan Retur network and track performance"
      >
        <Button size={"icon-lg"} variant={"outline"}>
          <ChartColumnDecreasing className="size-6" />
        </Button>
      </Header>

      <ReturnedGoodStatsContainer />

      <ReturnedGoodsTable />

      <ReturnedGoodsDialogs />
    </GuardedLayout>
    </ReturnedGoodsProvider>
  );
}
