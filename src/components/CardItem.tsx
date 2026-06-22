import type { BusinessCard } from '../types'
import { downloadVCard } from '../vcard'

interface Props {
  card: BusinessCard
  onDelete: (id: string) => void
}

export default function CardItem({ card, onDelete }: Props) {
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
        <button className="btn small primary" onClick={() => downloadVCard(card)}>
          + Add to Contacts
        </button>
        <button className="btn small danger" onClick={() => onDelete(card.id)}>
          Delete
        </button>
      </div>
    </div>
  )
}

function normalizeUrl(url: string): string {
  return /^https?:\/\//i.test(url) ? url : `https://${url}`
}
