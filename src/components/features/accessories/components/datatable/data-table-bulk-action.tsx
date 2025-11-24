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
import { AccessoriesMultiDeleteDialog } from "./accessories-multi-delete-dialog";

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
      <BulkActionsToolbar table={table} entityName="accessories">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="destructive"
              size="icon"
              onClick={() => setShowDeleteConfirm(true)}
              className="size-8"
              aria-label="Delete selected accessories"
              title="Delete selected accessories"
            >
              <Trash2 />
              <span className="sr-only">Delete selected accessories</span>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>
              Delete {selectedRows.length} selected accessories
              {selectedRows.length > 1 ? "s" : ""}
            </p>
          </TooltipContent>
        </Tooltip>
      </BulkActionsToolbar>

      <AccessoriesMultiDeleteDialog
        table={table}
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
      />
    </>
  );
}