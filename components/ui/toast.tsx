'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react"

export type ToastType = 'success' | 'error' | 'info'

interface ToastProps {
  message: string
  type?: ToastType
  onClose: () => void
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  React.useEffect(() => {
    const timer = setTimeout(onClose, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    error: <AlertCircle className="w-5 h-5 text-red-500" />,
    info: <Info className="w-5 h-5 text-blue-500" />
  }

  const backgrounds = {
    success: 'bg-green-50 border-green-100',
    error: 'bg-red-50 border-red-100',
    info: 'bg-blue-50 border-blue-100'
  }

  return (
    <div className={cn(
      "fixed bottom-4 right-4 flex items-center gap-3 p-4 rounded-lg border shadow-lg animate-in fade-in slide-in-from-bottom-4",
      backgrounds[type]
    )}>
      {icons[type]}
      <p className="text-sm font-medium text-slate-900">{message}</p>
      <button onClick={onClose} className="p-1 hover:bg-white/50 rounded transition-colors">
        <X className="w-4 h-4 text-slate-400" />
      </button>
    </div>
  )
}

export function useToast() {
  const [toast, setToast] = React.useState<{ message: string, type: ToastType } | null>(null)

  const showToast = (message: string, type: ToastType = 'info') => {
    setToast({ message, type })
  }

  const hideToast = () => setToast(null)

  const ToastComponent = toast ? (
    <Toast message={toast.message} type={toast.type} onClose={hideToast} />
  ) : null

  return { showToast, ToastComponent }
}
