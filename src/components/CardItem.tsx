import { useState } from 'react'
import type { BusinessCard } from '../types'
import { downloadVCard } from '../vcard'
import Spinner from './Spinner'
import ConfirmSheet from './ConfirmSheet'

interface Props {
  card: BusinessCard
  onDelete: (id: string) => void
}

export default function CardItem({ card, onDelete }: Props) {
  const [adding, setAdding] = useState(false)
  const [confirming, setConfirming] = useState(false)

  function handleAddContact() {
    setAdding(true)
    downloadVCard(card)
    // downloadVCard is synchronous; brief busy state gives tactile feedback.
    setTimeout(() => setAdding(false), 600)
  }

  function handleConfirmDelete() {
    // Close the sheet and remove the card immediately; delete runs in the background.
    setConfirming(false)
    onDelete(card.id)
  }

  return (
    <div className="card">
      <div className="card-main">
        <div className="card-head">
          <h3>{card.name || 'Unnamed'}</h3>
          {card.category && <span className="tag">{card.category}</span>}
        </div>
        {card.title && <p className="muted">{card.title}</p>}
        {card.company && <p className="company">{card.company}</p>}
        <div className="contacts">
          {card.phone && <a href={`tel:${card.phone}`}>{card.phone}</a>}
          {card.email && <a href={`mailto:${card.email}`}>{card.email}</a>}
          {card.website && (
            <a href={normalizeUrl(card.website)} target="_blank" rel="noreferrer">
              {card.website}
            </a>
          )}
          {card.address && <span className="muted">{card.address}</span>}
        </div>
      </div>
      <div className="card-actions">
        <button
          className="btn small primary"
          onClick={handleAddContact}
          disabled={adding}
        >
          {adding ? <Spinner /> : '+ Add to Contacts'}
        </button>
        <button className="btn small danger" onClick={() => setConfirming(true)}>
          Delete
        </button>
      </div>

      {confirming && (
        <ConfirmSheet
          title="Delete this card?"
          message="This can't be undone."
          confirmLabel="Delete"
          destructive
          onConfirm={handleConfirmDelete}
          onCancel={() => setConfirming(false)}
        />
      )}
    </div>
  )
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}
