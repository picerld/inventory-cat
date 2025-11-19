import { useState } from "react";
import { type Table } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { DataTableBulkActions as BulkActionsToolbar } from "~/components/datatable/data-table-bulk-action";
import { SemiFinishedGoodsMultiDeleteDialog } from "./semi-finished-multi-delete-dialog";

type DataTableBulkActionsProps<TData> = {
  table: Table<TData>;
};

export function DataTableBulkActions<TData>({
  table,
}: DataTableBulkActionsProps<TData>) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const selectedRows = table.getFilteredSelectedRowModel().rows;

  return (
    <>
      <BulkActionsToolbar table={table} entityName="semi-finished">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected semi finished"
              title="Delete selected semi finished"
            >
              <Trash2 />
              <span className="sr-only">Delete selected semi finished</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Delete {selectedRows.length} selected semi finished
              {selectedRows.length > 1 ? "s" : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <SemiFinishedGoodsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}
