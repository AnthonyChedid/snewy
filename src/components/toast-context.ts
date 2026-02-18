import { createContext } from 'react'

export type ToastType = 'error' | 'success' | 'info'

export type ToastItem = { id: number; message: string; type: ToastType }

export type ToastContextType = {
  pushToast: (message: string, type?: ToastType) => void
}

export const ToastContext = createContext<ToastContextType | undefined>(undefined)
