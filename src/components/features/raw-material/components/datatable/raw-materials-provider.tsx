import React, { useState } from 'react'
import useDialogState from '~/hooks/use-dialog-state'
import type { RawMaterialFormSchema } from '../form/raw-material'

type RawMaterialDialogType = 'add' | 'edit' | 'delete'

type RawMaterialContextType = {
  open: RawMaterialDialogType | null
  setOpen: (str: RawMaterialDialogType | null) => void
  currentRow: RawMaterialFormSchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<RawMaterialFormSchema | null>>
}

const RawMaterialsContext = React.createContext<RawMaterialContextType | null>(null)

export function RawMaterialsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<RawMaterialDialogType>(null)
  const [currentRow, setCurrentRow] = useState<RawMaterialFormSchema | null>(null)

  return (
    <RawMaterialsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </RawMaterialsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useRawMaterials = () => {
  const rawMaterialsContext = React.useContext(RawMaterialsContext)

  if (!rawMaterialsContext) {
    throw new Error('useUsers has to be used within <rawMaterialsContext>')
  }

  return rawMaterialsContext
}