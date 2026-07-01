import type { BusinessCard } from './types'
import { supabase } from './supabase'

// Shape of a row in the public.cards table. user_id is set server-side via the
// column default (auth.uid()) and enforced by RLS, so the client never sends it.
interface CardRow {
  id: string
  name: string
  title: string
  company: string
  phone: string
  email: string
  website: string
  address: string
  category: string
  image_data_url: string | null
  created_at: number
}

function rowToCard(r: CardRow): BusinessCard {
  return {
    id: r.id,
    name: r.name,
    title: r.title,
    company: r.company,
    phone: r.phone,
    email: r.email,
    website: r.website,
    address: r.address,
    category: r.category,
    imageDataUrl: r.image_data_url ?? undefined,
    createdAt: r.created_at,
  }
}

function cardToRow(c: BusinessCard): CardRow {
  return {
    id: c.id,
    name: c.name,
    title: c.title,
    company: c.company,
    phone: c.phone,
    email: c.email,
    website: c.website,
    address: c.address,
    category: c.category,
    image_data_url: c.imageDataUrl ?? null,
    created_at: c.createdAt,
  }
}

export async function getAllCards(): Promise<BusinessCard[]> {
  const { data, error } = await supabase
    .from('cards')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data as CardRow[]).map(rowToCard)
}

export async function saveCard(card: BusinessCard): Promise<void> {
  const { error } = await supabase.from('cards').upsert(cardToRow(card))
  if (error) throw error
}

export async function deleteCard(id: string): Promise<void> {
  const { error } = await supabase.from('cards').delete().eq('id', id)
  if (error) throw error
}
