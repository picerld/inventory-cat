import { useGrades } from "./grade-provider";
import { GradesActionDialog } from "./grades-action-dialog";
import { GradesDeleteDialog } from "./grades-delete-dialog";
import { GradesDetailsDialog } from "./grades-details-dialog";

export function GradesDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useGrades();

  return (
    <>
      <GradesActionDialog
        key="grade-add"
        open={open === "add"}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null);
          }
        }}
      />

      {currentRow && (
        <>
          <GradesDetailsDialog
            key={`grade-detail-${currentRow.id}`}
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
          <GradesActionDialog
            key={`grade-edit-${currentRow.id}`}
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

          <GradesDeleteDialog
            key={`grade-delete-${currentRow.id}`}
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
