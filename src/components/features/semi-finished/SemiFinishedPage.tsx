import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { SemiFinishedGoodsTable } from "./components/datatable/semi-finished-table";
import { SemiFinishedGoodsDialogs } from "./components/datatable/semi-finished-dialog";
import { SemiFinishedGoodsProvider } from "./components/datatable/semi-finished-provider";
import { SemiFinishedGoodStatsContainer } from "./components/SemiFinishedGoodStatsContainer";
import { ChartNoAxesCombined } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function RawMaterialPage() {
  return (
    <SemiFinishedGoodsProvider>
      <GuardedLayout>
        <HeadMetaData title="Bahan Setengah Jadi" />
        <Header
          title="Bahan Setengah Jadi"
          subtitle="Manage your Bahan Setengah Jadi network and track performance"
        >
          <Button size={"icon-lg"} variant={"outline"}>
            <ChartNoAxesCombined className="size-6" />
          </Button>
        </Header>

        <SemiFinishedGoodStatsContainer />

        <SemiFinishedGoodsTable />

        <SemiFinishedGoodsDialogs />
      </GuardedLayout>
    </SemiFinishedGoodsProvider>
  );
}
