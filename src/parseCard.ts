import type { ParsedFields } from './types'

const EMAIL_RE = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/i
const PHONE_RE = /(\+?\d[\d\s().\-]{7,}\d)/
const URL_RE = /((https?:\/\/)?(www\.)?[a-z0-9-]+\.[a-z]{2,}(\/[^\s]*)?)/i

const COMPANY_SUFFIX_RE =
  /\b(inc|incorporated|ltd|limited|llc|llp|plc|pvt|private|corp|corporation|company|co|gmbh|s\.?a\.?|s\.?r\.?l\.?|technologies|solutions|systems|group|industries|enterprises|associates|consulting|labs|studio|studios)\b\.?/i

const TITLE_KEYWORDS_RE =
  /\b(manager|director|engineer|developer|designer|ceo|cto|cfo|coo|founder|co-?founder|president|vp|vice president|head|lead|officer|executive|consultant|analyst|architect|specialist|coordinator|administrator|owner|partner|associate|representative|sales|marketing|account)\b/i

const ADDRESS_HINT_RE =
  /\b(street|st|road|rd|avenue|ave|lane|ln|drive|dr|blvd|boulevard|suite|ste|floor|fl|building|bldg|block|sector|nagar|colony|po box|p\.o\.|zip|pincode|pin)\b/i

/** Strip a leading icon/label like "T:", "M:", "E:", "Tel", "Mobile", "•" etc. */
function clean(line: string): string {
  return line.replace(/\s+/g, ' ').trim()
}

function looksLikePersonName(line: string): boolean {
  const words = line.split(/\s+/)
  if (words.length < 1 || words.length > 4) return false
  // Mostly alphabetic words, each starting with a capital letter, no digits/@.
  if (/[@\d]/.test(line)) return false
  const capWords = words.filter((w) => /^[A-Z][a-zA-Z.'-]*$/.test(w))
  return capWords.length >= Math.min(2, words.length)
}

export function parseCard(rawText: string): ParsedFields {
  const lines = rawText
    .split('\n')
    .map(clean)
    .filter((l) => l.length > 0)

  const used = new Set<number>()
  const fields: ParsedFields = {
    name: '',
    title: '',
    company: '',
    phone: '',
    email: '',
    website: '',
    address: '',
  }

  // --- email ---
  const emailMatch = rawText.match(EMAIL_RE)
  if (emailMatch) fields.email = emailMatch[0].toLowerCase()
  const emailDomain = fields.email.split('@')[1] ?? ''

  // --- phone ---
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(PHONE_RE)
    if (m) {
      fields.phone = m[1].replace(/\s{2,}/g, ' ').trim()
      break
    }
  }

  // --- website (skip the line that holds the email, and the email's own domain) ---
  for (let i = 0; i < lines.length; i++) {
    if (EMAIL_RE.test(lines[i])) continue
    const m = lines[i].match(URL_RE)
    if (m) {
      const candidate = m[0]
      if (emailDomain && candidate.toLowerCase().includes(emailDomain)) continue
      fields.website = candidate
      break
    }
  }

  // --- company (line with a corporate suffix) ---
  for (let i = 0; i < lines.length; i++) {
    if (EMAIL_RE.test(lines[i]) || URL_RE.test(lines[i])) continue
    if (COMPANY_SUFFIX_RE.test(lines[i])) {
      fields.company = lines[i]
      used.add(i)
      break
    }
  }

  // --- title / designation (line with a role keyword) ---
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i) || EMAIL_RE.test(lines[i])) continue
    if (TITLE_KEYWORDS_RE.test(lines[i]) && !PHONE_RE.test(lines[i])) {
      fields.title = lines[i]
      used.add(i)
      break
    }
  }

  // --- name (first plausible person-name line near the top) ---
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue
    if (EMAIL_RE.test(lines[i]) || URL_RE.test(lines[i]) || PHONE_RE.test(lines[i]))
      continue
    if (looksLikePersonName(lines[i])) {
      fields.name = lines[i]
      used.add(i)
      break
    }
  }

  // --- address (lines with address hints or digit-heavy leftovers) ---
  const addressLines: string[] = []
  for (let i = 0; i < lines.length; i++) {
    if (used.has(i)) continue
    const l = lines[i]
    if (EMAIL_RE.test(l) || URL_RE.test(l) || PHONE_RE.test(l)) continue
    if (ADDRESS_HINT_RE.test(l) || /\d/.test(l)) {
      addressLines.push(l)
      used.add(i)
    }
  }
  fields.address = addressLines.join(', ')

  // Fallback company: if none found, use first unused line that isn't the name.
  if (!fields.company) {
    for (let i = 0; i < lines.length; i++) {
      if (used.has(i) || lines[i] === fields.name) continue
      if (EMAIL_RE.test(lines[i]) || URL_RE.test(lines[i]) || PHONE_RE.test(lines[i]))
        continue
      fields.company = lines[i]
      break
    }
  }

  return fields
}
