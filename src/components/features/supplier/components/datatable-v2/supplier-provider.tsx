import React, { useState } from 'react'
import useDialogState from '~/hooks/use-dialog-state'
import type { SupplierFormSchema } from '../../form/supplier'

type SupplierDialogType = 'add' | 'edit' | 'delete'

type SupplierContextType = {
  open: SupplierDialogType | null
  setOpen: (str: SupplierDialogType | null) => void
  currentRow: SupplierFormSchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<SupplierFormSchema | null>>
}

const SuppliersContext = React.createContext<SupplierContextType | null>(null)

export function SuppliersProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<SupplierDialogType>(null)
  const [currentRow, setCurrentRow] = useState<SupplierFormSchema | null>(null)

  return (
    <SuppliersContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </SuppliersContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useSuppliers = () => {
  const suppliersContext = React.useContext(SuppliersContext)

  if (!suppliersContext) {
    throw new Error('useUsers has to be used within <suppliersContext>')
  }

  return suppliersContext
}