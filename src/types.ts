export interface BusinessCard {
  id: string
  name: string
  title: string // designation
  company: string
  phone: string
  email: string
  website: string
  address: string
  category: string // user-added tag, e.g. "Vendor", "Client"
  imageDataUrl?: string // optional thumbnail of the scanned card
  createdAt: number
}

/** Fields produced by OCR parsing (everything except id/category/timestamps). */
export type ParsedFields = Pick<
  BusinessCard,
  'name' | 'title' | 'company' | 'phone' | 'email' | 'website' | 'address'
>
