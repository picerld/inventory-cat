import GuardedLayout from "~/components/layout/GuardedLayout";
import { SuppliersProvider } from "./components/datatable-v2/supplier-provider";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { Header } from "~/components/container/Header";
import { SuppliersTable } from "./components/datatable-v2/suppliers-table";
import { SuppliersDialogs } from "./components/datatable-v2/suppliers-dialog";
import SupplierStatsContainer from "./components/SupplierStatsContainer";
import { Button } from "~/components/ui/button";
import { Truck } from "lucide-react";

export default function SupplierPage() {
  return (
    <SuppliersProvider>
      <GuardedLayout>
        <HeadMetaData title="Supplier" />
        <Header
          title="Supplier"
          subtitle="Manage your supplier network and track performance"
        >
          <Button size={"icon-lg"} variant={"outline"}>
            <Truck className="size-6" />
          </Button>
        </Header>

        <SupplierStatsContainer />

        <SuppliersTable />

        <SuppliersDialogs />
      </GuardedLayout>
    </SuppliersProvider>
  );
}
