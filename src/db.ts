import { openDB, type DBSchema, type IDBPDatabase } from 'idb'
import type { BusinessCard } from './types'

interface WalletDB extends DBSchema {
  cards: {
    key: string
    value: BusinessCard
    indexes: { 'by-createdAt': number }
  }
}

const DB_NAME = 'card-wallet'
const DB_VERSION = 1

let dbPromise: Promise<IDBPDatabase<WalletDB>> | null = null

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<WalletDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore('cards', { keyPath: 'id' })
        store.createIndex('by-createdAt', 'createdAt')
      },
    })
  }
  return dbPromise
}

export async function getAllCards(): Promise<BusinessCard[]> {
  const db = await getDB()
  const cards = await db.getAllFromIndex('cards', 'by-createdAt')
  return cards.reverse() // newest first
}

export async function saveCard(card: BusinessCard): Promise<void> {
  const db = await getDB()
  await db.put('cards', card)
}

export async function deleteCard(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('cards', id)
}
