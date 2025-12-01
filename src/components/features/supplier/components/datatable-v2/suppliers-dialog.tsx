import { useSuppliers } from "./supplier-provider";
import { SuppliersActionDialog } from "./suppliers-action-dialog";
import { SuppliersDeleteDialog } from "./suppliers-delete-dialog";
import { SuppliersDetailsDialog } from "./suppliers-details-dialog";

export function SuppliersDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSuppliers();

  return (
    <>
      <SuppliersActionDialog
        key="supplier-add"
        open={open === "add"}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null);
          }
        }}
      />

      {currentRow && (
        <>
          <SuppliersDetailsDialog
            key={`supplier-detail-${currentRow.id}`}
            open={open === "detail"}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 300);
              }
            }}
            // @ts-expect-error type
            currentRow={currentRow}
          />
          <SuppliersActionDialog
            key={`supplier-edit-${currentRow.id}`}
            open={open === "edit"}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 300);
              }
            }}
            // @ts-expect-error type
            currentRow={currentRow}
          />

          <SuppliersDeleteDialog
            key={`supplier-delete-${currentRow.id}`}
            open={open === "delete"}
            onOpenChange={(state) => {
              if (!state) {
                setOpen(null);
                setTimeout(() => {
                  setCurrentRow(null);
                }, 300);
              }
            }}
            // @ts-expect-error type
            currentRow={currentRow}
          />
        </>
      )}
    </>
  );
}
