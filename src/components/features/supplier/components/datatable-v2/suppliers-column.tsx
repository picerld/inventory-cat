import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "~/components/datatable/data-table-column-header";
import { LongText } from "~/components/ui/long-text";
import type { Supplier } from "~/types/supplier";
import { DataTableRowActions } from "./data-table-row-action";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

export const suppliersColumns: ColumnDef<Supplier>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    meta: {
      className: cn("max-md:sticky start-0 z-10 rounded-tl-[inherit]"),
    },
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
      />
    ),
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    cell: ({ row }) => (
      <LongText className="ps-3">{row.getValue("name")}</LongText>
    ),
    meta: {
      className: cn(
        "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]",
        "ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none",
      ),
    },
  },
  {
    accessorKey: "RawMaterials",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bahan Baku" />
    ),
    cell: ({ row }) => {
      const details = row.original.RawMaterial;
      const materialCount = details?.length ?? 0;

      if (materialCount === 0) {
        return (
          <div className="text-muted-foreground ps-2">Tidak ada bahan</div>
        );
      }

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Badge variant="secondary" className="cursor-pointer text-xs">
                {materialCount} Bahan
              </Badge>
            </TooltipTrigger>

            <TooltipContent side="top" className="max-w-xs">
              <div className="mb-1 text-sm font-medium">Daftar Bahan:</div>

              <ul className="space-y-1 text-xs">
                {details?.map((material) => (
                  <li key={material.id}>• {material.name}</li>
                ))}
              </ul>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Description" />
    ),
    cell: ({ row }) => (
      <div className="w-fit ps-2 text-nowrap">
        {row.getValue("description")}
      </div>
    ),
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
    enableSorting: false,
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
