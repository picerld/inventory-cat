import { useSuppliers } from "./supplier-provider";
import { SuppliersActionDialog } from "./suppliers-action-dialog";
import { SuppliersDeleteDialog } from "./suppliers-delete-dialog";

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
            currentRow={currentRow}
          />
        </>
      )}
    </>
  );
}