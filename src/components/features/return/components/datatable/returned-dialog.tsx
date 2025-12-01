import { ReturnGoodsActionDialog } from "./returned-action-dialog";
import { ReturnGoodsDeleteDialog } from "./returned-delete-dialog";
import { ReturnedGoodDetailsDialog } from "./returned-details-dialog";
import { useReturnedGoods } from "./returned-provider";

export function ReturnedGoodsDialogs() {
  const { open, setOpen, currentRow, setCurrentRow } = useReturnedGoods();

  return (
    <>
      <ReturnGoodsActionDialog
        key="returned-add"
        open={open === "add"}
        onOpenChange={(state) => {
          if (!state) {
            setOpen(null);
          }
        }}
      />

      {currentRow && (
        <>
          <ReturnedGoodDetailsDialog
            key={`returned-detail-${currentRow.id}`}
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
          <ReturnGoodsActionDialog
            key={`returned-edit-${currentRow.id}`}
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

          <ReturnGoodsDeleteDialog
            key={`returned-delete-${currentRow.id}`}
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
