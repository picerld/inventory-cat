import { type ColumnDef } from "@tanstack/react-table";
import { Checkbox } from "~/components/ui/checkbox";
import { DataTableColumnHeader } from "~/components/datatable/data-table-column-header";
import { LongText } from "~/components/ui/long-text";
import { Badge } from "~/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { DataTableRowActions } from "./data-table-row-action";
import type { ReturnGood } from "~/types/return-good";
import { cn } from "~/lib/utils";

export const returnGoodsColumns: ColumnDef<ReturnGood>[] = [
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
    accessorKey: "finishedGoodId",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Barang Jadi" />
    ),
    cell: ({ row }) => (
      <LongText className="ps-3">
        {row.original.finishedGood?.name ?? "—"}
      </LongText>
    ),
    meta: {
      className:
        "ps-0.5 max-md:sticky start-6 drop-shadow-sm dark:drop-shadow-none",
    },
  },
  {
    accessorKey: "qty",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Jumlah" />
    ),
    cell: ({ row }) => <div className="ps-2">{row.getValue("qty")}</div>,
  },
  {
    accessorKey: "from",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Dari" />
    ),
    cell: ({ row }) => (
      <div className="w-fit ps-2">{row.getValue("from") || "—"}</div>
    ),
    enableSorting: false,
  },
  {
    accessorKey: "description",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Deskripsi" />
    ),
    cell: ({ row }) => (
      <div className="w-fit ps-2">{row.getValue("description") || "—"}</div>
    ),
    enableSorting: false,
  },
  {
    id: "actions",
    cell: DataTableRowActions,
  },
];
