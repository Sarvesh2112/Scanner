import { useState } from 'react'
import type { BusinessCard, ParsedFields } from '../types'
import Spinner from './Spinner'

/**
 * Generate a unique id. crypto.randomUUID() only exists in a secure context
 * (HTTPS or localhost), so over plain-HTTP LAN access (e.g. on a phone) we fall
 * back to a timestamp + random string.
 */
function newId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID()
  }
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

interface Props {
  fields: ParsedFields
  imageDataUrl: string
  onSave: (card: BusinessCard) => Promise<void>
  onCancel: () => void
}

const FIELD_DEFS: { key: keyof ParsedFields; label: string; type?: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'title', label: 'Designation' },
  { key: 'company', label: 'Company' },
  { key: 'phone', label: 'Contact number', type: 'tel' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'website', label: 'Website' },
  { key: 'address', label: 'Address' },
]

export default function ReviewForm({ fields, imageDataUrl, onSave, onCancel }: Props) {
  const [values, setValues] = useState<ParsedFields>(fields)
  const [category, setCategory] = useState('')
  const [saving, setSaving] = useState(false)

  function update(key: keyof ParsedFields, value: string) {
    setValues((v) => ({ ...v, [key]: value }))
  }

  async function handleSave() {
    if (saving) return
    const card: BusinessCard = {
      id: newId(),
      ...values,
      category: category.trim(),
      imageDataUrl,
      createdAt: Date.now(),
    }
    setSaving(true)
    try {
      await onSave(card)
      // On success the view switches away; leave saving true until unmount.
    } catch {
      setSaving(false)
    }
  }

  return (
    <div className="view">
      <header className="topbar">
        <button className="link" onClick={onCancel} disabled={saving}>
          ‹ Back
        </button>
        <h1>Review details</h1>
        <span />
      </header>

      <div className="form-body">
        {imageDataUrl && (
          <img className="thumb" src={imageDataUrl} alt="Scanned card" />
        )}
        <p className="hint">Check the fields below and fix anything OCR got wrong.</p>

        {FIELD_DEFS.map(({ key, label, type }) => (
          <label className="field" key={key}>
            <span>{label}</span>
            {key === 'address' ? (
              <textarea
                value={values[key]}
                rows={2}
                onChange={(e) => update(key, e.target.value)}
              />
            ) : (
              <input
                type={type ?? 'text'}
                value={values[key]}
                onChange={(e) => update(key, e.target.value)}
              />
            )}
          </label>
        ))}

        <label className="field">
          <span>Category tag</span>
          <input
            type="text"
            placeholder="e.g. Client, Vendor, Conference"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </label>

        <button
          className="btn primary full"
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? <Spinner /> : 'Save to wallet'}
        </button>
      </div>
    </div>
  )
}
