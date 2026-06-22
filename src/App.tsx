import { useEffect, useState } from 'react'
import type { BusinessCard, ParsedFields } from './types'
import { deleteCard, getAllCards, saveCard } from './db'
import WalletList from './components/WalletList'
import CaptureView from './components/CaptureView'
import ReviewForm from './components/ReviewForm'

type View =
  | { name: 'wallet' }
  | { name: 'capture' }
  | { name: 'review'; fields: ParsedFields; imageDataUrl: string }

export default function App() {
  const [cards, setCards] = useState<BusinessCard[]>([])
  const [view, setView] = useState<View>({ name: 'wallet' })

  useEffect(() => {
    getAllCards().then(setCards)
  }, [])

  async function handleSave(card: BusinessCard) {
    await saveCard(card)
    setCards(await getAllCards())
    setView({ name: 'wallet' })
  }

  async function handleDelete(id: string) {
    await deleteCard(id)
    setCards(await getAllCards())
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
      onScanNew={() => setView({ name: 'capture' })}
      onDelete={handleDelete}
    />
  )
}
