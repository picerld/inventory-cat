import { RawMaterialsActionDialog } from "./raw-materials-action-dialog";
import { RawMaterialsDeleteDialog } from "./raw-materials-delete-dialog";
import { useRawMaterials } from "./raw-materials-provider";

export function RawMaterialsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useRawMaterials();

  return (
    <>
      <RawMaterialsActionDialog
        key="raw-material-add"
        open={open === "add"}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null);
          }
        }}
      />

      {currentRow && (
        <>
          <RawMaterialsActionDialog
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

          <RawMaterialsDeleteDialog
            key={`raw-material-delete-${currentRow.id}`}
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