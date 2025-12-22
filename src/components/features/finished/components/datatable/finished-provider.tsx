import React, { useState } from "react";
import useDialogState from "~/hooks/use-dialog-state";
import type { FinishedGoodFormSchema } from "../../form/finished-good";

type FinishedGoodDialogType = "add" | "edit" | "delete" | "detail" | "qr";

type FinishedGoodContextType = {
  open: FinishedGoodDialogType | null;
  setOpen: (str: FinishedGoodDialogType | null) => void;
  currentRow: FinishedGoodFormSchema | null;
  setCurrentRow: React.Dispatch<
    React.SetStateAction<FinishedGoodFormSchema | null>
  >;
};

const FinishedGoodsContext =
  React.createContext<FinishedGoodContextType | null>(null);

export function FinishedGoodsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useDialogState<FinishedGoodDialogType>(null);
  const [currentRow, setCurrentRow] =
    useState<FinishedGoodFormSchema | null>(null);

  return (
    <FinishedGoodsContext
      value={{ open, setOpen, currentRow, setCurrentRow }}
    >
      {children}
    </FinishedGoodsContext>
  );
}

export const useFinishedGoods = () => {
  const finishedGoodsContext = React.useContext(FinishedGoodsContext);

  if (!finishedGoodsContext) {
    throw new Error(
      "useUsers has to be used within <finishedGoodsContext>",
    );
  }

  return finishedGoodsContext;
};
