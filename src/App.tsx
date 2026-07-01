import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import type { BusinessCard, ParsedFields } from './types'
import { deleteCard, getAllCards, saveCard } from './db'
import { useAuth, type GoogleUser } from './auth'
import WalletList from './components/WalletList'
import CaptureView from './components/CaptureView'
import ReviewForm from './components/ReviewForm'
import SignIn from './components/SignIn'

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
    try {
      await saveCard(card)
      setCards(await getAllCards())
      setView({ name: 'wallet' })
    } catch (e) {
      console.error('Save failed:', e)
      alert(`Save failed: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  async function handleDelete(id: string) {
    try {
      await deleteCard(id)
      setCards(await getAllCards())
    } catch (e) {
      console.error('Delete failed:', e)
      alert(`Delete failed: ${e instanceof Error ? e.message : String(e)}`)
    }
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
