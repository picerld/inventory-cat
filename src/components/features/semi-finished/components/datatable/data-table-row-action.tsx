import { type Row } from "@tanstack/react-table";
import {
  ClipboardPen,
  GripVertical,
  Info,
  QrCode,
  Trash2,
  UserPen,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { SemiFinishedGood } from "~/types/semi-finished-good";
import { useSemiFinishedGoods } from "./semi-finished-provider";

type DataTableRowActionsProps = {
  row: Row<SemiFinishedGood>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const { setOpen, setCurrentRow } = useSemiFinishedGoods();
  return (
    <div className="flex gap-2">
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            size={"icon-lg"}
            variant="ghost"
            className="data-[state=open]:bg-muted flex p-0"
          >
            <GripVertical className="h-4 w-4" />
            <span className="sr-only">Open menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-[160px]">
          <DropdownMenuItem
            onClick={() => {
              // @ts-expect-error type
              setCurrentRow(row.original);
              setOpen("detail");
            }}
          >
            Detail
            <DropdownMenuShortcut>
              <Info size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => {
              // @ts-expect-error type
              setCurrentRow(row.original);
              setOpen("edit");
            }}
          >
            Edit
            <DropdownMenuShortcut>
              <UserPen size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              // @ts-expect-error type
              setCurrentRow(row.original);
              setOpen("delete");
            }}
            className="text-red-500!"
          >
            Delete
            <DropdownMenuShortcut>
              <Trash2 size={16} />
            </DropdownMenuShortcut>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <Button
        onClick={() => {
          // @ts-expect-error type
          setCurrentRow(row.original);
          setOpen("update-qty");
        }}
        variant={"outline"}
        size={"icon-lg"}
      >
        <ClipboardPen className="size-5" />
      </Button>
      <Button
        onClick={() => {
          // @ts-expect-error type
          setCurrentRow(row.original);
          setOpen("qr");
        }}
        variant={"outline"}
        size={"icon-lg"}
      >
        <QrCode className="size-5" />
      </Button>
    </div>
  );
}
