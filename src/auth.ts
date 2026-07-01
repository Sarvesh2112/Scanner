import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

/** The signed-in user, derived from the Supabase session. */
export interface GoogleUser {
  sub: string // Supabase user id (== auth.uid(), used for RLS)
  email: string
  name: string
  picture: string
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const GIS_SRC = 'https://accounts.google.com/gsi/client'

// Minimal shape of the Google Identity Services API we use.
interface CredentialResponse {
  credential: string
}
interface GoogleAccountsId {
  initialize(config: {
    client_id: string
    callback: (res: CredentialResponse) => void
  }): void
  renderButton(
    parent: HTMLElement,
    options: {
      type?: string
      theme?: string
      size?: string
      width?: number
      text?: string
      shape?: string
      logo_alignment?: string
    },
  ): void
  disableAutoSelect(): void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

function sessionToUser(session: Session | null): GoogleUser | null {
  if (!session) return null
  const u = session.user
  const m = u.user_metadata ?? {}
  return {
    sub: u.id,
    email: u.email ?? m.email ?? '',
    name: m.full_name ?? m.name ?? u.email ?? '',
    picture: m.avatar_url ?? m.picture ?? '',
  }
}

let gisPromise: Promise<void> | null = null
function loadGis(): Promise<void> {
  if (window.google?.accounts?.id) return Promise.resolve()
  if (gisPromise) return gisPromise
  gisPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = GIS_SRC
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Identity Services'))
    document.head.appendChild(script)
  })
  return gisPromise
}

let initialized = false
async function ensureInitialized() {
  if (initialized) return
  if (!CLIENT_ID) throw new Error('Missing VITE_GOOGLE_CLIENT_ID in .env.local')
  await loadGis()
  window.google!.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: async (res) => {
      // Exchange the Google ID token for a Supabase session (enables RLS).
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'google',
        token: res.credential,
      })
      if (error) console.error('Supabase sign-in failed:', error.message)
    },
  })
  initialized = true
}

/** Renders the official "Sign in with Google" button into `el`. */
export async function renderGoogleButton(el: HTMLElement) {
  await ensureInitialized()
  window.google!.accounts.id.renderButton(el, {
    type: 'standard',
    theme: 'filled_black',
    size: 'large',
    text: 'continue_with',
    shape: 'pill',
    logo_alignment: 'center',
  })
}

export async function signOut() {
  window.google?.accounts.id.disableAutoSelect()
  await supabase.auth.signOut()
}

/** Tracks the signed-in user via the Supabase session. */
export function useAuth() {
  const [user, setUser] = useState<GoogleUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(sessionToUser(data.session))
      setLoading(false)
    })
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(sessionToUser(session))
    })
    return () => sub.subscription.unsubscribe()
  }, [])

  return { user, loading, signOut }
}
