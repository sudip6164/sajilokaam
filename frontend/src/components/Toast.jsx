import { useEffect } from 'react'

export function Toast({ message, type = 'info', onClose, duration = 3000 }) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose()
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [duration, onClose])

  const styles = {
    success: {
      bg: 'bg-gradient-to-r from-emerald-500/90 to-teal-600/90',
      border: 'border-emerald-400/30',
      icon: '✓'
    },
    error: {
      bg: 'bg-gradient-to-r from-rose-500/90 to-pink-600/90',
      border: 'border-rose-400/30',
      icon: '✕'
    },
    warning: {
      bg: 'bg-gradient-to-r from-amber-500/90 to-orange-600/90',
      border: 'border-amber-400/30',
      icon: '⚠'
    },
    info: {
      bg: 'bg-gradient-to-r from-violet-500/90 to-purple-600/90',
      border: 'border-violet-400/30',
      icon: 'ℹ'
    }
  }[type]

  return (
    <div className={`${styles.bg} backdrop-blur-xl border-2 ${styles.border} text-white px-6 py-4 rounded-2xl shadow-2xl mb-4 flex items-center justify-between min-w-[320px] max-w-md animate-in slide-in-from-right transition-all duration-300`}>
      <div className="flex items-center gap-3">
        <span className="text-xl font-bold">{styles.icon}</span>
        <span className="font-semibold">{message}</span>
      </div>
      <button 
        onClick={onClose} 
        className="ml-4 text-white/90 hover:text-white hover:scale-110 transition-all text-xl font-bold leading-none"
      >
        ×
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, removeToast }) {
  if (toasts.length === 0) return null

  return (
    <div className="fixed top-24 right-4 z-50 flex flex-col-reverse">
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          onClose={() => removeToast(toast.id)}
          duration={toast.duration}
        />
      ))}
    </div>
  )
}
