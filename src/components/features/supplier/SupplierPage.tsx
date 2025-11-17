"use client";

import { Download, Plus, Upload } from "lucide-react";
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
import SupplierStatsContainer from "./components/SupplierStatsContainer";
import { HeadMetaData } from "~/components/meta/HeadMetaData";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { CreateSupplierForm } from "./create/CreateSupplierForm";
import { SupplierDatatable } from "./components/datatable/supplier-datatable";

export default function SupplierPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState<boolean>(false);

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
              <Button variant={"outline"}>
                Export <Upload className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Export To</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>PDF Document</DropdownMenuItem>
                <DropdownMenuItem>Excel Spreadsheet</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant={"outline"}>
                Import <Download className="ml-2 size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end">
              <DropdownMenuLabel>Import From</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem>PDF Document</DropdownMenuItem>
                <DropdownMenuItem>Excel Spreadsheet</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <CreateSupplierForm
            isCreateModalOpen={isCreateModalOpen}
            setIsCreateModalOpen={setIsCreateModalOpen}
          />
        </div>
      </Header>

      <SupplierStatsContainer />

      <SupplierDatatable />
    </GuardedLayout>
  );
}
