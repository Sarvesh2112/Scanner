import type { ParsedFields } from './types'

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined
const MODEL = 'gemini-2.5-flash'
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`

const EMPTY_FIELDS: ParsedFields = {
  name: '',
  title: '',
  company: '',
  phone: '',
  email: '',
  website: '',
  address: '',
}

/** Split a data URL ("data:image/jpeg;base64,AAAA") into mime type + base64 body. */
function splitDataUrl(dataUrl: string): { mimeType: string; data: string } {
  const match = /^data:([^;]+);base64,(.*)$/.exec(dataUrl)
  if (!match) throw new Error('Expected a base64 data URL')
  return { mimeType: match[1], data: match[2] }
}

const PROMPT = `You are reading a photo of a business card. Extract the contact details
into the provided JSON schema. Rules:
- Use the exact text on the card; do not invent or guess missing values.
- If a field is not present, return an empty string for it.
- "name" is the person's full name; "title" is their job designation/role.
- "company" is the organization name.
- "phone" is a single best phone number (prefer mobile), digits and + only.
- "email" is the email address; "website" is the URL.
- "address" is the full postal/street address on one line.`

const RESPONSE_SCHEMA = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    title: { type: 'string' },
    company: { type: 'string' },
    phone: { type: 'string' },
    email: { type: 'string' },
    website: { type: 'string' },
    address: { type: 'string' },
  },
  required: ['name', 'title', 'company', 'phone', 'email', 'website', 'address'],
}

/**
 * Send the card image directly to Gemini and get back structured fields.
 * Runs in the browser against the Generative Language REST API — no OCR step.
 */
export async function extractCardFields(imageDataUrl: string): Promise<ParsedFields> {
  if (!API_KEY) {
    throw new Error('Missing VITE_GEMINI_API_KEY — add it to .env.local and restart the dev server.')
  }

  const { mimeType, data } = splitDataUrl(imageDataUrl)

  const res = await fetch(`${ENDPOINT}?key=${API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: PROMPT }, { inline_data: { mime_type: mimeType, data } }],
        },
      ],
      generationConfig: {
        temperature: 0,
        responseMimeType: 'application/json',
        responseSchema: RESPONSE_SCHEMA,
      },
    }),
  })

  if (!res.ok) {
    const detail = await res.text().catch(() => '')
    throw new Error(`Gemini request failed (${res.status}): ${detail.slice(0, 300)}`)
  }

  const body = await res.json()
  const text: string | undefined = body?.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned no content')

  let parsed: Partial<ParsedFields>
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('Gemini returned non-JSON output')
  }

  // Normalize: keep only known string fields, fall back to empty strings.
  return {
    name: String(parsed.name ?? '').trim(),
    title: String(parsed.title ?? '').trim(),
    company: String(parsed.company ?? '').trim(),
    phone: String(parsed.phone ?? '').trim(),
    email: String(parsed.email ?? '').trim(),
    website: String(parsed.website ?? '').trim(),
    address: String(parsed.address ?? '').trim(),
  } satisfies ParsedFields
}

export { EMPTY_FIELDS }
