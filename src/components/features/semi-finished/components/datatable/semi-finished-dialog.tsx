import { SemiFinishedGoodsActionDialog } from "./semi-finished-action-dialog";
import { SemiFinishedGoodsDeleteDialog } from "./semi-finished-delete-dialog";
import { SemiFinishedGoodDetailsDialog } from "./semi-finished-details-dialog";
import { useSemiFinishedGoods } from "./semi-finished-provider";

export function SemiFinishedGoodsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useSemiFinishedGoods();

  return (
    <>
      <SemiFinishedGoodsActionDialog
        key="semi-finished-add"
        open={open === "add"}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null);
          }
        }}
      />

      {currentRow && (
        <>
          <SemiFinishedGoodDetailsDialog
            key={`semi-finished-detail-${currentRow.id}`}
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

          <SemiFinishedGoodsActionDialog
            key={`semi-finished-edit-${currentRow.id}`}
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

          <SemiFinishedGoodsDeleteDialog
            key={`semi-finished-delete-${currentRow.id}`}
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
