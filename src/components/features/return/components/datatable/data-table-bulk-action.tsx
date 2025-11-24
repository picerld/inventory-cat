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
import { ReturnedGoodsMultiDeleteDialog } from "./returned-multi-delete-dialog";

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
      <BulkActionsToolbar table={table} entityName="returned">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected returned"
              title="Delete selected returned"
            >
              <Trash2 />
              <span className="sr-only">Delete selected returned</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Delete {selectedRows.length} selected returned
              {selectedRows.length > 1 ? "s" : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <ReturnedGoodsMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}