import React, { useState } from 'react'
import useDialogState from '~/hooks/use-dialog-state'
import type { AccessoriesFormSchema } from '../../form/accessories'

type AccessoriesDialogType = 'add' | 'edit' | 'delete' | 'detail'

type AccessoriesContextType = {
  open: AccessoriesDialogType | null
  setOpen: (str: AccessoriesDialogType | null) => void
  currentRow: AccessoriesFormSchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<AccessoriesFormSchema | null>>
}

const AccessoriessContext = React.createContext<AccessoriesContextType | null>(null)

export function AccessoriessProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<AccessoriesDialogType>(null)
  const [currentRow, setCurrentRow] = useState<AccessoriesFormSchema | null>(null)

  return (
    <AccessoriessContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </AccessoriessContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useAccessoriess = () => {
  const accessoriesContext = React.useContext(AccessoriessContext)

  if (!accessoriesContext) {
    throw new Error('useUsers has to be used within <accessoriesContext>')
  }

  return accessoriesContext
}