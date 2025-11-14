import {
  TruckElectric,
} from "lucide-react";
import { Header } from "~/components/container/Header";
import GuardedLayout from "~/components/layout/GuardedLayout";
import { Button } from "~/components/ui/button";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import SupplierStatsContainer from "./SupplierStatsContainer";
import { HeadMetaData } from "~/components/meta/HeadMetaData";

export default function SupplierPage() {
  return (
    <GuardedLayout>
      <HeadMetaData title="Supplier" />
      <Header
        title="Supplier"
        subtitle="Manage your supplier network and track performance"
      >
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>Import Data</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Import From</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>PDF Document</DropdownMenuItem>
                <DropdownMenuItem>Excel Spreadsheet</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button>
            Add Supplier <TruckElectric className="ml-2 size-4" />
          </Button>
        </div>
      </Header>

      <SupplierStatsContainer />
    </GuardedLayout>
  );
}
