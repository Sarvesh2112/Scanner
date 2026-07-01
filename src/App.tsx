import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { BusinessCard, ParsedFields } from './types'
import { deleteCard, getAllCards, saveCard } from './db'
import { useAuth, type GoogleUser } from './auth'
import WalletList from './components/WalletList'
import CaptureView from './components/CaptureView'
import ReviewForm from './components/ReviewForm'
import SignIn from './components/SignIn'

/** Supabase throws plain objects ({ message, code, details, hint }), not Errors. */
function formatErr(e: unknown): string {
  if (e instanceof Error) return e.message
  if (e && typeof e === 'object') {
    const o = e as Record<string, unknown>
    const parts = [o.message, o.details, o.hint, o.code && `(${o.code})`]
      .filter(Boolean)
      .join(' — ')
    return parts || JSON.stringify(e)
  }
  return String(e)
}

export default function App() {
  const { user, signOut } = useAuth()

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to="/" replace /> : <SignIn />}
      />
      <Route
        path="/"
        element={
          user ? (
            <Wallet user={user} onSignOut={signOut} />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

type View =
  | { name: 'wallet' }
  | { name: 'capture' }
  | { name: 'review'; fields: ParsedFields; imageDataUrl: string }

function Wallet({ user, onSignOut }: { user: GoogleUser; onSignOut: () => void }) {
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [view, setView] = useState<View>({ name: 'wallet' })

  useEffect(() => {
    getAllCards().then(setCards)
  }, [])

  async function handleSave(card: BusinessCard) {
    // Optimistically show the card and return to the wallet immediately;
    // persist in the background and roll back if it fails.
    setCards((cs) => [card, ...cs])
    setView({ name: 'wallet' })
    try {
      await saveCard(card)
    } catch (e) {
      console.error('Save failed:', e)
      alert(`Save failed: ${formatErr(e)}`)
      setCards((cs) => cs.filter((c) => c.id !== card.id))
    }
  }

  function handleDelete(id: string) {
    // Remove from the UI immediately; delete in the background, restore on error.
    const removed = cards.find((c) => c.id === id)
    setCards((cs) => cs.filter((c) => c.id !== id))
    deleteCard(id).catch((e) => {
      console.error('Delete failed:', e)
      alert(`Delete failed: ${formatErr(e)}`)
      if (removed) setCards((cs) => [removed, ...cs].sort((a, b) => b.createdAt - a.createdAt))
    })
  }

  if (view.name === 'capture') {
    return (
      <CaptureView
        onCancel={() => setView({ name: 'wallet' })}
        onScanned={(fields, imageDataUrl) =>
          setView({ name: 'review', fields, imageDataUrl })
        }
      />
    )
  }

  if (view.name === 'review') {
    return (
      <ReviewForm
        fields={view.fields}
        imageDataUrl={view.imageDataUrl}
        onCancel={() => setView({ name: 'wallet' })}
        onSave={handleSave}
      />
    )
  }

  return (
    <WalletList
      cards={cards}
      user={user}
      onSignOut={onSignOut}
      onScanNew={() => setView({ name: 'capture' })}
      onDelete={handleDelete}
    />
  )
}
