import { useEffect, useState } from 'react'

/** Profile decoded from the Google ID token (JWT). */
export interface GoogleUser {
  sub: string // stable Google account id
  email: string
  name: string
  picture: string
}

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID
const STORAGE_KEY = 'card-wallet-user'
const GIS_SRC = 'https://accounts.google.com/gsi/client'

// Minimal shape of the Google Identity Services API we use.
interface CredentialResponse {
  credential: string
}
interface GoogleAccountsId {
  initialize(config: {
    client_id: string
    callback: (res: CredentialResponse) => void
    auto_select?: boolean
  }): void
  renderButton(
    parent: HTMLElement,
    options: { theme?: string; size?: string; width?: number; text?: string },
  ): void
  disableAutoSelect(): void
}
declare global {
  interface Window {
    google?: { accounts: { id: GoogleAccountsId } }
  }
}

function decodeJwt(token: string): GoogleUser {
  const payload = JSON.parse(
    atob(token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/')),
  )
  return {
    sub: payload.sub,
    email: payload.email,
    name: payload.name,
    picture: payload.picture,
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

// Single subscriber list so every hook instance stays in sync.
type Listener = (user: GoogleUser | null) => void
const listeners = new Set<Listener>()

function readStored(): GoogleUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as GoogleUser) : null
  } catch {
    return null
  }
}

function setUser(user: GoogleUser | null) {
  if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  else localStorage.removeItem(STORAGE_KEY)
  listeners.forEach((l) => l(user))
}

let initialized = false
async function ensureInitialized() {
  if (initialized) return
  if (!CLIENT_ID) throw new Error('Missing VITE_GOOGLE_CLIENT_ID in .env.local')
  await loadGis()
  window.google!.accounts.id.initialize({
    client_id: CLIENT_ID,
    callback: (res) => setUser(decodeJwt(res.credential)),
  })
  initialized = true
}

/** Renders the official "Sign in with Google" button into `el`. */
export async function renderGoogleButton(el: HTMLElement) {
  await ensureInitialized()
  window.google!.accounts.id.renderButton(el, {
    theme: 'outline',
    size: 'large',
    text: 'continue_with',
  })
}

export function signOut() {
  window.google?.accounts.id.disableAutoSelect()
  setUser(null)
}

/** Tracks the signed-in Google user, persisted across reloads in localStorage. */
export function useAuth() {
  const [user, setUserState] = useState<GoogleUser | null>(readStored)

  useEffect(() => {
    listeners.add(setUserState)
    return () => {
      listeners.delete(setUserState)
    }
  }, [])

  return { user, signOut }
}
