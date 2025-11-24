import React, { useState } from 'react'
import useDialogState from '~/hooks/use-dialog-state'
import type { ReturnedGoodFormSchema } from '../../form/returned-good'

type ReturnedGoodDialogType = 'add' | 'edit' | 'delete' | 'detail'

type ReturnedGoodContextType = {
  open: ReturnedGoodDialogType | null
  setOpen: (str: ReturnedGoodDialogType | null) => void
  currentRow: ReturnedGoodFormSchema | null
  setCurrentRow: React.Dispatch<React.SetStateAction<ReturnedGoodFormSchema | null>>
}

const ReturnedGoodsContext = React.createContext<ReturnedGoodContextType | null>(null)

export function ReturnedGoodsProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useDialogState<ReturnedGoodDialogType>(null)
  const [currentRow, setCurrentRow] = useState<ReturnedGoodFormSchema | null>(null)

  return (
    <ReturnedGoodsContext value={{ open, setOpen, currentRow, setCurrentRow }}>
      {children}
    </ReturnedGoodsContext>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export const useReturnedGoods = () => {
  const returnedGoodsContext = React.useContext(ReturnedGoodsContext)

  if (!returnedGoodsContext) {
    throw new Error('useUsers has to be used within <returnedGoodsContext>')
  }

  return returnedGoodsContext
}