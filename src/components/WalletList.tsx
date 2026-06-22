import { useMemo, useState } from 'react'
import type { BusinessCard } from '../types'
import type { Theme } from '../useTheme'
import CardItem from './CardItem'

interface Props {
  cards: BusinessCard[]
  onScanNew: () => void
  onDelete: (id: string) => void
  theme: Theme
  onToggleTheme: () => void
}

export default function WalletList({
  cards,
  onScanNew,
  onDelete,
  theme,
  onToggleTheme,
}: Props) {
  const [filter, setFilter] = useState('')
  const [query, setQuery] = useState('')

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
      <header className="topbar">
        <span />
        <h1>Card Wallet</h1>
        <button
          className="link theme-toggle"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </header>

      <div className="list-body">
        {cards.length > 0 && (
          <input
            className="search"
            type="search"
            placeholder="Search cards…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
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
