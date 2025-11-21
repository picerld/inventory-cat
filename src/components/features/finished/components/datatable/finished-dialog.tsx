import { FinishedGoodsActionDialog } from "./finished-action-dialog";
import { FinishedGoodsDeleteDialog } from "./finished-delete-dialog";
import { FinishedGoodDetailsDialog } from "./finished-details-dialog";
import { useFinishedGoods } from "./finished-provider";

export function FinishedGoodsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useFinishedGoods();

  return (
    <>
      <FinishedGoodsActionDialog
        key="finished-add"
        open={open === "add"}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null);
          }
        }}
      />

      {currentRow && (
        <>
          <FinishedGoodDetailsDialog
            key={`finished-detail-${currentRow.id}`}
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

          <FinishedGoodsActionDialog
            key={`finished-edit-${currentRow.id}`}
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

          <FinishedGoodsDeleteDialog
            key={`finished-delete-${currentRow.id}`}
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
