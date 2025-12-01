import { type Row } from "@tanstack/react-table";
import { GripVertical, Info, Trash2, UserPen } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import type { FinishedGood } from "~/types/finished-good";
import { useFinishedGoods } from "./finished-provider";
import { useRouter } from "next/navigation";

type DataTableRowActionsProps = {
  row: Row<FinishedGood>;
};

export function DataTableRowActions({ row }: DataTableRowActionsProps) {
  const router = useRouter();

  const { setOpen, setCurrentRow } = useFinishedGoods();
  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="data-[state=open]:bg-muted flex h-8 w-8 p-0"
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
              // setCurrentRow(row.original);
              // setOpen("edit");

              router.push(`/items/finished/edit/${row.original.id}`);
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
    </>
  );
}
