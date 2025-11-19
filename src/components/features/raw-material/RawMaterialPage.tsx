import GuardedLayout from "~/components/layout/GuardedLayout";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { RawMaterialsDialogs } from "./components/datatable/raw-materials-dialog";
import { RawMaterialsTable } from "./components/datatable/raw-materials-table";
import { RawMaterialsProvider } from "./components/datatable/raw-materials-provider";
import { RawMaterialStatsContainer } from "./components/RawMaterialStatsContainer";

export default function RawMaterialPage() {
  return (
    <RawMaterialsProvider>
      <GuardedLayout>
        <HeadMetaData title="Bahan Baku" />
        <Header
          title="Bahan Baku"
          subtitle="Manage your Bahan Baku network and track performance"
        ></Header>

        <RawMaterialStatsContainer />

        <RawMaterialsTable />

        <RawMaterialsDialogs />
      </GuardedLayout>
    </RawMaterialsProvider>
  );
}
