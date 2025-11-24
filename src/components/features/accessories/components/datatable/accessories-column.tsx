import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "~/components/datatable/data-table-column-header";
import { LongText } from "~/components/ui/long-text";
import { DataTableRowActions } from "./data-table-row-action";
import { toRupiah } from "../../../../../lib/utils";
import { Badge } from "~/components/ui/badge";
import type { PainAccessories } from "~/types/paint-accessories";

export const accessoriesColumns: ColumnDef<PainAccessories>[] = [
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
    accessorKey: "supplierId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Supplier" />
    ),
    cell: ({ row }) => (
      <div className="w-fit ps-2 text-nowrap">
        {row.original.supplier?.name}
      </div>
    ),
    filterFn: (row, columnId, filterValue: string[]) => {
      return filterValue.includes(row.getValue(columnId) as string);
    },
    enableSorting: false,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nama Barang" />
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
    accessorKey: "qty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Kuantiti" />
    ),
    cell: ({ row }) => (
      <LongText className="ps-3">{row.getValue("qty")}</LongText>
    ),
    meta: {
      className: cn(
        "drop-shadow-[0_1px_2px_rgb(0_0_0_/_0.1)] dark:drop-shadow-[0_1px_2px_rgb(255_255_255_/_0.1)]",
        "ps-0.5 max-md:sticky start-6 @4xl/content:table-cell @4xl/content:drop-shadow-none",
      ),
    },
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
