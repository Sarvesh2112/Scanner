import { useEffect, useRef } from 'react'
import Spinner from './Spinner'

interface Props {
  title: string
  message?: string
  confirmLabel?: string
  destructive?: boolean
  loading?: boolean
  onConfirm: () => void
  onCancel: () => void
}

/** iOS-style action sheet: dimmed backdrop + panel sliding up from the bottom. */
export default function ConfirmSheet({
  title,
  message,
  confirmLabel = 'Confirm',
  destructive = false,
  loading = false,
  onConfirm,
  onCancel,
}: Props) {
  const confirmRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    confirmRef.current?.focus()
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape' && !loading) onCancel()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [loading, onCancel])

  return (
    <div
      className="sheet-backdrop"
      onClick={() => !loading && onCancel()}
      role="dialog"
      aria-modal="true"
    >
      <div className="sheet" onClick={(e) => e.stopPropagation()}>
        <div className="sheet-group">
          <div className="sheet-header">
            <p className="sheet-title">{title}</p>
            {message && <p className="sheet-message">{message}</p>}
          </div>
          <button
            ref={confirmRef}
            className={`sheet-btn ${destructive ? 'destructive' : ''}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <Spinner /> : confirmLabel}
          </button>
        </div>
        <button className="sheet-btn cancel" onClick={onCancel} disabled={loading}>
          Cancel
        </button>
      </div>
    </div>
  )
}
