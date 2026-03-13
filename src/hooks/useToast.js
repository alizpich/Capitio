import { useState, useCallback } from 'react'

export function useToast() {
  const [toasts, setToasts] = useState([])

  const toast = useCallback(({ message, type = 'default' }) => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3000)
  }, [])

  const success = useCallback((message) => toast({ message, type: 'success' }), [toast])
  const error = useCallback((message) => toast({ message, type: 'error' }), [toast])
  const warn = useCallback((message) => toast({ message, type: 'warn' }), [toast])

  return { toasts, toast, success, error, warn }
}
