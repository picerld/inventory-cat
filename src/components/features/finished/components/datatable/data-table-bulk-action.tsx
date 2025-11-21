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
import { FinishedGoodsMultiDeleteDialog } from "./finished-multi-delete-dialog";

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
      <BulkActionsToolbar table={table} entityName="finished">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected finished"
              title="Delete selected finished"
            >
              <Trash2 />
              <span className="sr-only">Delete selected finished</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Delete {selectedRows.length} selected finished
              {selectedRows.length > 1 ? "s" : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <FinishedGoodsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}
