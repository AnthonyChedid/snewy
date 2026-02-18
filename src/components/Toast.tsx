import { useMemo, useState, type ReactNode } from 'react'
import { ToastContext, type ToastItem, type ToastType } from './toast-context'

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const pushToast = (message: string, type: ToastType = 'info') => {
    const id = Date.now() + Math.floor(Math.random() * 1000)
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }

  const value = useMemo(() => ({ pushToast }), [])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`min-w-56 rounded-md px-3 py-2 text-sm shadow ${
              t.type === 'error'
                ? 'bg-rose-600 text-white'
                : t.type === 'success'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-white'
            }`}
          >
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
