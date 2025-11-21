import React, { useState } from "react";
import useDialogState from "~/hooks/use-dialog-state";
import type { SemiFinishedGoodFormSchema } from "../../form/semi-finished";

type SemiFinishedGoodDialogType = "add" | "edit" | "delete" | "detail";

type SemiFinishedGoodContextType = {
  open: SemiFinishedGoodDialogType | null;
  setOpen: (str: SemiFinishedGoodDialogType | null) => void;
  currentRow: SemiFinishedGoodFormSchema | null;
  setCurrentRow: React.Dispatch<
    React.SetStateAction<SemiFinishedGoodFormSchema | null>
  >;
};

const SemiFinishedGoodsContext =
  React.createContext<SemiFinishedGoodContextType | null>(null);

export function SemiFinishedGoodsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<SemiFinishedGoodDialogType>(null);
  const [currentRow, setCurrentRow] =
    useState<SemiFinishedGoodFormSchema | null>(null);

  return (
    <SemiFinishedGoodsContext
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </SemiFinishedGoodsContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSemiFinishedGoods = () => {
  const semiFinishedGoodsContext = React.useContext(SemiFinishedGoodsContext);

  if (!semiFinishedGoodsContext) {
    throw new Error(
      "useUsers has to be used within <semiFinishedGoodsContext>",
    );
  }

  return semiFinishedGoodsContext;
};
