import type { BusinessCard } from './types'

/** Escape special characters per the vCard spec. */
function esc(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;')
}

/** Split a "First Last" name into vCard N components (Family;Given). */
function splitName(name: string): { family: string; given: string } {
  const parts = name.trim().split(/\s+/)
  if (parts.length === 0) return { family: '', given: '' }
  if (parts.length === 1) return { family: '', given: parts[0] }
  return { family: parts[parts.length - 1], given: parts.slice(0, -1).join(' ') }
}

export function buildVCard(card: BusinessCard): string {
  const { family, given } = splitName(card.name)
  const lines: string[] = ['BEGIN:VCARD', 'VERSION:3.0']

  lines.push(`N:${esc(family)};${esc(given)};;;`)
  lines.push(`FN:${esc(card.name || card.company || 'Unknown')}`)
  if (card.company) lines.push(`ORG:${esc(card.company)}`)
  if (card.title) lines.push(`TITLE:${esc(card.title)}`)
  if (card.phone) lines.push(`TEL;TYPE=CELL:${esc(card.phone)}`)
  if (card.email) lines.push(`EMAIL;TYPE=INTERNET:${esc(card.email)}`)
  if (card.website) lines.push(`URL:${esc(card.website)}`)
  if (card.address) lines.push(`ADR;TYPE=WORK:;;${esc(card.address)};;;;`)
  if (card.category) lines.push(`CATEGORIES:${esc(card.category)}`)

  lines.push('END:VCARD')
  return lines.join('\r\n')
}

/**
 * Trigger a .vcf download / open. On iOS Safari this opens the native
 * "Add Contact" sheet with one tap.
 */
export function downloadVCard(card: BusinessCard): void {
  const vcard = buildVCard(card)
  const blob = new Blob([vcard], { type: 'text/vcard;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const safeName = (card.name || card.company || 'contact').replace(/[^\w-]+/g, '_')
  a.download = `${safeName}.vcf`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
