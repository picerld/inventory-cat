import React, { useState } from "react";
import useDialogState from "~/hooks/use-dialog-state";
import type { GradeFormSchema } from "../../form/grade";

type GradeDialogType = "add" | "edit" | "delete" | "detail";

type GradeContextType = {
  open: GradeDialogType | null;
  setOpen: (str: GradeDialogType | null) => void;
  currentRow: GradeFormSchema | null;
  setCurrentRow: React.Dispatch<React.SetStateAction<GradeFormSchema | null>>;
};

const GradesContext = React.createContext<GradeContextType | null>(null);

export function GradesProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<GradeDialogType>(null);
  const [currentRow, setCurrentRow] = useState<GradeFormSchema | null>(null);

  return (
    <GradesContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </GradesContext>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useGrades = () => {
  const gradesContext = React.useContext(GradesContext);

  if (!gradesContext) {
    throw new Error("useUsers has to be used within <gradesContext>");
  }

  return gradesContext;
};
