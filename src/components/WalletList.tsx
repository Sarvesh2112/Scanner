import { useMemo, useState } from 'react'
import type { BusinessCard } from '../types'
import type { GoogleUser } from '../auth'
import CardItem from './CardItem'

interface Props {
  cards: BusinessCard[]
  user: GoogleUser
  onSignOut: () => void
  onScanNew: () => void
  onDelete: (id: string) => void
}

export default function WalletList({
  cards,
  user,
  onSignOut,
  onScanNew,
  onDelete,
}: Props) {
  const [filter, setFilter] = useState('')
  const [query, setQuery] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)

  const categories = useMemo(() => {
    const set = new Set<string>()
    cards.forEach((c) => c.category && set.add(c.category))
    return Array.from(set).sort()
  }, [cards])

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase()
    return cards.filter((c) => {
      if (filter && c.category !== filter) return false
      if (!q) return true
      return [c.name, c.company, c.title, c.email, c.phone]
        .join(' ')
        .toLowerCase()
        .includes(q)
    })
  }, [cards, filter, query])

  return (
    <div className="view">
      <header className="wallet-header">
        <div className="brand">
          <span className="brand-icon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path
                d="M3 8a3 3 0 0 1 3-3h11a2 2 0 0 1 2 2v1h1a2 2 0 0 1 2 2v6a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V8Z"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinejoin="round"
              />
              <circle cx="17" cy="13" r="1.6" fill="currentColor" />
            </svg>
          </span>
          <h1 className="large-title">Card Wallet</h1>
        </div>
        <div className="account">
          <button
            className="avatar-btn"
            title={user.name}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {user.picture ? (
              <img src={user.picture} alt={user.name} referrerPolicy="no-referrer" />
            ) : (
              <span className="avatar-fallback">
                {user.name.charAt(0).toUpperCase()}
              </span>
            )}
          </button>

          {menuOpen && (
            <>
              <div className="menu-backdrop" onClick={() => setMenuOpen(false)} />
              <div className="account-menu" role="menu">
                <div className="account-info">
                  {user.picture ? (
                    <img src={user.picture} alt="" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="avatar-fallback">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <div className="account-text">
                    <p className="account-name">{user.name}</p>
                    <p className="account-email">{user.email}</p>
                  </div>
                </div>
                <button
                  className="menu-item destructive"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    onSignOut()
                  }}
                >
                  Log out
                </button>
              </div>
            </>
          )}
        </div>
      </header>

      <div className="list-body">
        {cards.length > 0 && (
          <div className="search-wrap">
            <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="m20 20-3.5-3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              className="search"
              type="search"
              placeholder="Search cards…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        )}

        {categories.length > 0 && (
          <div className="chips">
            <button
              className={`chip ${filter === '' ? 'active' : ''}`}
              onClick={() => setFilter('')}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                className={`chip ${filter === cat ? 'active' : ''}`}
                onClick={() => setFilter(cat)}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {visible.length === 0 ? (
          <div className="empty">
            <p>No cards yet.</p>
            <p className="muted">Tap the button below to scan your first card.</p>
          </div>
        ) : (
          <div className="cards">
            {visible.map((card) => (
              <CardItem key={card.id} card={card} onDelete={onDelete} />
            ))}
          </div>
        )}
      </div>

      <button className="fab" onClick={onScanNew}>
        + Scan card
      </button>
    </div>
  )
}
