import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { userScopedStorage } from '@/lib/userStorage'
import api from '@/lib/api'

export interface ClientProperty {
  id: string
  label: string   // e.g. 'Home', 'Office', 'Site A'
  address: string
}

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string        // Primary / billing address
  properties?: ClientProperty[]  // Multiple job-site addresses
  notes?: string
  tags?: string[]
  createdAt: number
  updatedAt: number
}

interface ClientState {
  clients: Client[]
  addClient: (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateClient: (id: string, updates: Partial<Client>) => void
  deleteClient: (id: string) => void
  getClientById: (id: string) => Client | undefined
  searchClients: (query: string) => Client[]
  migrateFromJobs: () => void  // Manual migration trigger
}

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      clients: [],

      addClient: (clientData) => {
        const newClient: Client = {
          ...clientData,
          id: nanoid(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({ clients: [...state.clients, newClient] }))
        api.clients.create(newClient)
        return newClient.id
      },

      updateClient: (id, updates) => {
        const existing = get().clients.find((c) => c.id === id)
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...updates, updatedAt: Date.now() } : client
          ),
        }))
        api.clients.update(id, { ...existing, ...updates, updatedAt: Date.now() })
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        }))
        api.clients.delete(id)
      },

      getClientById: (id) => {
        return get().clients.find((client) => client.id === id)
      },

      searchClients: (query) => {
        if (!query.trim()) return get().clients
        
        const lowerQuery = query.toLowerCase()
        return get().clients.filter((client) => {
          return (
            client.name.toLowerCase().includes(lowerQuery) ||
            client.email?.toLowerCase().includes(lowerQuery) ||
            client.phone?.toLowerCase().includes(lowerQuery)
          )
        })
      },

      migrateFromJobs: () => {
        // No-op: migration from legacy data no longer needed
      },
    }),
    {
      name: 'fieldkit-clients',
      storage: userScopedStorage,
    }
  )
)
