import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { Button } from "~/components/ui/button";
import { ChartNoAxesCombined } from "lucide-react";
import { AccessoriesStatsContainer } from "./components/AccessoriesStatsContainer";
import { AccessoriessProvider } from "./components/datatable/accessories-provider";
import { AccessoriesTable } from "./components/datatable/accessories-table";
import { AccessoriesDialogs } from "./components/datatable/accessories-dialog";

export default function AccessoriesPage() {
  return (
    <AccessoriessProvider>
      <GuardedLayout>
        <HeadMetaData title="Aksesoris" />
        <Header
          title="Aksesoris Cat"
          subtitle="Manage your Aksesoris Cat network and track performance"
        >
          <Button size={"icon-lg"} variant={"outline"}>
            <ChartNoAxesCombined className="size-6" />
          </Button>
        </Header>

        <AccessoriesStatsContainer />

        <AccessoriesTable />

        <AccessoriesDialogs />
      </GuardedLayout>
    </AccessoriessProvider>
  );
}
