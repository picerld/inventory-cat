import { AccessoriesActionDialog } from "./accessories-action-dialog";
import { AccessoriesDeleteDialog } from "./accessories-delete-dialog";
import { AccessoriesDetailsDialog } from "./accessories-details-dialog";
import { useAccessoriess } from "./accessories-provider";

export function AccessoriesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useAccessoriess();

  return (
    <>
      <AccessoriesActionDialog
        key="accessories-add"
        open={open === "add"}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null);
          }
        }}
      />

      {currentRow && (
        <>
          <AccessoriesDetailsDialog
            key={`accessories-edit-${currentRow.id}`}
            open={open === "detail"}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 300);
              }
            }}
            currentRow={currentRow}
          />
          
          <AccessoriesActionDialog
            key={`raw-material-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 300);
              }
            }}
            currentRow={currentRow}
          />

          <AccessoriesDeleteDialog
            key={`accessories-delete-${currentRow.id}`}
            open={open === "delete"}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 300);
              }
            }}
            currentRow={currentRow}
          />
        </>
      )}
    </>
  );
}
