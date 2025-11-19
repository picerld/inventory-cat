import { type ColumnDef } from "@tanstack/react-table";
import { cn } from "~/lib/utils";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "~/components/datatable/data-table-column-header";
import { LongText } from "~/components/ui/long-text";
import { DataTableRowActions } from "./data-table-row-action";
import type { SemiFinishedGood } from "~/types/semi-finished-good";
import { Badge } from "~/components/ui/badge";

export const semiFinishedGoodsColumns: ColumnDef<SemiFinishedGood>[] = [
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
    accessorKey: "materials",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Bahan Baku" />
    ),
    cell: ({ row }) => {
      const details = row.original.SemiFinishedGoodDetail;
      const materialCount = details?.length ?? 0;

      if (materialCount === 0) {
        return (
          <div className="text-muted-foreground ps-2">Tidak ada bahan</div>
        );
      }

      return (
        <div className="flex items-center gap-2 ps-2">
          <Badge variant="secondary" className="text-xs">
            {materialCount} Bahan
          </Badge>
        </div>
      );
    },
    enableSorting: false,
  },
  {
    accessorKey: "userId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Admin" />
    ),
    cell: ({ row }) => (
      <div className="w-fit ps-2 text-nowrap">
        {row.original.user?.name ?? "-"}
      </div>
    ),
    filterFn: (row, columnId, filterValue: string[]) => {
      return filterValue.includes(row.getValue(columnId) as string);
    },
    enableSorting: false,
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tanggal Dibuat" />
    ),
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return (
        <div className="w-fit ps-2 text-nowrap">
          {date.toLocaleDateString("id-ID", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      );
    },
    enableSorting: true,
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
