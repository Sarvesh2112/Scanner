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
      <div className="signin-body">
        <h1>Card Wallet</h1>
        <p className="muted">Sign in to access your cards.</p>
        <div ref={btnRef} className="google-btn-slot" />
        {error && <p className="error">{error}</p>}
      </div>
    </div>
  )
}
