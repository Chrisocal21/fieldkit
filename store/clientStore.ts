import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export interface Client {
  id: string
  name: string
  email?: string
  phone?: string
  address?: string
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

// Mock data - will be populated by migration from existing jobs
const mockClients: Client[] = []

// Helper function to extract clients from jobs
const extractClientsFromJobs = (jobs: any[]): Client[] => {
  const clientMap = new Map<string, Client>()
  
  jobs.forEach((job: any) => {
    if (job.clientName && job.clientName.trim()) {
      const key = job.clientName.toLowerCase().trim()
      
      if (!clientMap.has(key)) {
        clientMap.set(key, {
          id: nanoid(),
          name: job.clientName,
          email: job.clientEmail || undefined,
          phone: job.clientPhone || undefined,
          address: job.siteAddress || undefined,
          notes: undefined,
          tags: [],
          createdAt: job.createdAt || Date.now(),
          updatedAt: Date.now(),
        })
      }
    }
  })
  
  return Array.from(clientMap.values())
}

export const useClientStore = create<ClientState>()(
  persist(
    (set, get) => ({
      clients: mockClients,

      addClient: (clientData) => {
        const newClient: Client = {
          ...clientData,
          id: nanoid(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({ clients: [...state.clients, newClient] }))
        return newClient.id
      },

      updateClient: (id, updates) => {
        set((state) => ({
          clients: state.clients.map((client) =>
            client.id === id ? { ...client, ...updates, updatedAt: Date.now() } : client
          ),
        }))
      },

      deleteClient: (id) => {
        set((state) => ({
          clients: state.clients.filter((client) => client.id !== id),
        }))
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
        // Only migrate if we have no clients yet
        if (get().clients.length > 0) return

        try {
          // Try to get jobs from localStorage first
          const jobsData = localStorage.getItem('fieldkit-jobs')
          if (jobsData) {
            const jobsState = JSON.parse(jobsData)
            const jobs = jobsState?.state?.jobs || []
            
            if (jobs.length > 0) {
              const extractedClients = extractClientsFromJobs(jobs)
              set({ clients: extractedClients })
              console.log(`Migrated ${extractedClients.length} clients from jobs`)
              return
            }
          }

          // Fallback: Try to import jobStore directly
          const { useJobStore } = require('./jobStore')
          const jobs = useJobStore.getState().jobs
          
          if (jobs && jobs.length > 0) {
            const extractedClients = extractClientsFromJobs(jobs)
            set({ clients: extractedClients })
            console.log(`Migrated ${extractedClients.length} clients from jobStore`)
          }
        } catch (error) {
          console.error('Failed to migrate clients:', error)
        }
      },
    }),
    {
      name: 'fieldkit-clients',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Auto-migrate clients from jobs if clients list is empty
        if (persistedState && (!persistedState.clients || persistedState.clients.length === 0)) {
          try {
            // Try to get jobs from localStorage
            const jobsData = localStorage.getItem('fieldkit-jobs')
            if (jobsData) {
              const jobsState = JSON.parse(jobsData)
              const jobs = jobsState?.state?.jobs || []
              
              if (jobs.length > 0) {
                persistedState.clients = extractClientsFromJobs(jobs)
                console.log(`Migrated ${persistedState.clients.length} clients from jobs`)
              }
            }
          } catch (error) {
            console.error('Failed to migrate clients from jobs:', error)
            persistedState.clients = []
          }
        }
        return persistedState
      },
    }
  )
)
