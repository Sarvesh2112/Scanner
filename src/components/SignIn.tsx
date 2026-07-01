import { useEffect, useRef, useState } from 'react'
import { renderGoogleButton } from '../auth'

export default function SignIn() {
  const btnRef = useRef<HTMLDivElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!btnRef.current) return
    renderGoogleButton(btnRef.current).catch((e) =>
      setError(e instanceof Error ? e.message : 'Sign-in unavailable'),
    )
  }, [])

  return (
    <div className="view signin">
      <div className="signin-center">
        <div className="signin-icon">
          <svg width="42" height="42" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path
              d="M3 8a3 3 0 0 1 3-3h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8Z"
              stroke="currentColor"
              strokeWidth="1.7"
              strokeLinejoin="round"
            />
            <circle cx="17" cy="13" r="1.6" fill="currentColor" />
          </svg>
        </div>
        <h1>cardZee</h1>
        <p className="muted">Scan, organize, and save business cards.</p>
        <div ref={btnRef} className="google-btn-slot" />
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
