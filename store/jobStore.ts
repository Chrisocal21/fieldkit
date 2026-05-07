import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { Quote } from './quoteStore'
import { userScopedStorage, getCurrentUserId } from '@/lib/userStorage'
import api from '@/lib/api'

export type JobStatus = 'Draft' | 'Quoted' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'

export interface Job {
  id: string
  title: string
  clientId?: string  // Primary reference to Client (Phase 7)
  // Legacy fields - kept for backward compatibility
  clientName: string
  clientEmail?: string
  clientPhone?: string
  siteAddress?: string
  description: string
  status: JobStatus
  assigneeId?: string
  startDate?: number
  dueDate?: number
  notes: string
  quotes: Quote[]  // Quotes now live within jobs
  archived: boolean
  createdAt: number
  updatedAt: number
}

interface JobState {
  jobs: Job[]
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'archived' | 'quotes'>) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  archiveJob: (id: string) => void
  getJobById: (id: string) => Job | undefined
  getJobsByClientId: (clientId: string) => Job[]
  // Quote management within jobs
  addQuoteToJob: (jobId: string, quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'jobId' | 'createdAt' | 'updatedAt'>) => void
  updateJobQuote: (jobId: string, quoteId: string, updates: Partial<Quote>) => void
  acceptJobQuote: (jobId: string, quoteId: string) => void
  deleteJobQuote: (jobId: string, quoteId: string) => void
  getJobQuotes: (jobId: string) => Quote[]
}

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: [],
      
      addJob: (jobData) => {
        const newJob: Job = {
          ...jobData,
          id: `JOB-${String(get().jobs.length + 1).padStart(4, '0')}`,
          quotes: [],  // Initialize with empty quotes array
          archived: false,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({ jobs: [...state.jobs, newJob] }))
        api.jobs.create(newJob)
      },
      
      updateJob: (id, updates) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...updates, updatedAt: Date.now() } : job
          ),
        }))
        api.jobs.update(id, { ...updates, updatedAt: Date.now() })
      },
      
      archiveJob: (id) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, archived: true, updatedAt: Date.now() } : job
          ),
        }))
        api.jobs.archive(id)
      },
      
      getJobById: (id) => {
        return get().jobs.find((job) => job.id === id)
      },

      getJobsByClientId: (clientId) => {
        return get().jobs.filter((job) => job.clientId === clientId && !job.archived)
      },
      
      // Quote management within jobs
      addQuoteToJob: (jobId, quoteData) => {
        let newQuote: Quote | null = null
        set((state) => ({
          jobs: state.jobs.map((job) => {
            if (job.id === jobId) {
              const jobQuotes = job.quotes || []
              const allQuotes = state.jobs.flatMap(j => j.quotes || [])
              const maxQuoteNumber = allQuotes.length > 0 
                ? Math.max(...allQuotes.map(q => q.quoteNumber)) 
                : 1000
              newQuote = {
                ...quoteData,
                id: nanoid(),
                jobId: jobId,
                quoteNumber: maxQuoteNumber + 1,
                createdAt: Date.now(),
                updatedAt: Date.now(),
              }
              return {
                ...job,
                quotes: [...jobQuotes, newQuote],
                status: job.status === 'Draft' ? 'Quoted' : job.status,
                updatedAt: Date.now(),
              }
            }
            return job
          }),
        }))
        if (newQuote) api.jobs.addQuote(jobId, newQuote)
      },
      
      updateJobQuote: (jobId, quoteId, updates) => {
        set((state) => ({
          jobs: state.jobs.map((job) => {
            if (job.id === jobId && job.quotes) {
              return {
                ...job,
                quotes: job.quotes.map((quote) =>
                  quote.id === quoteId
                    ? { ...quote, ...updates, updatedAt: Date.now() }
                    : quote
                ),
                updatedAt: Date.now(),
              }
            }
            return job
          }),
        }))
        api.quotes.update(quoteId, { ...updates, updatedAt: Date.now() })
      },
      
      acceptJobQuote: (jobId, quoteId) => {
        set((state) => ({
          jobs: state.jobs.map((job) => {
            if (job.id === jobId && job.quotes) {
              return {
                ...job,
                status: 'Scheduled',
                quotes: job.quotes.map((quote) => {
                  if (quote.id === quoteId) {
                    return { ...quote, status: 'Accepted' as const, updatedAt: Date.now() }
                  }
                  if (quote.status !== 'Declined') {
                    return { ...quote, status: 'Declined' as const, updatedAt: Date.now() }
                  }
                  return quote
                }),
                updatedAt: Date.now(),
              }
            }
            return job
          }),
        }))
        api.quotes.update(quoteId, { status: 'Accepted' })
        api.jobs.update(jobId, { status: 'Scheduled' })
      },
      
      deleteJobQuote: (jobId, quoteId) => {
        set((state) => ({
          jobs: state.jobs.map((job) => {
            if (job.id === jobId && job.quotes) {
              return {
                ...job,
                quotes: job.quotes.filter((quote) => quote.id !== quoteId),
                updatedAt: Date.now(),
              }
            }
            return job
          }),
        }))
        api.quotes.delete(quoteId)
      },
      
      getJobQuotes: (jobId) => {
        const job = get().jobs.find((j) => j.id === jobId)
        return job?.quotes || []
      },
    }),
    {
      name: 'fieldkit-jobs',
      storage: userScopedStorage,
      version: 2,
      migrate: (persistedState: any, version: number) => {
        // Ensure all jobs have a quotes array (added in Phase 6.5)
        if (persistedState && persistedState.jobs) {
          persistedState.jobs = persistedState.jobs.map((job: any) => ({
            ...job,
            quotes: job.quotes || [], // Initialize quotes array if missing
          }))

          // Link jobs with clients (added in Phase 7)
          // Try to get clients from localStorage to link them
          try {
            const clientsData = localStorage.getItem(`fieldkit-clients__${getCurrentUserId() ?? ''}`)
            if (clientsData) {
              const clientsState = JSON.parse(clientsData)
              const clients = clientsState?.state?.clients || []

              // Link each job to its client if not already linked
              persistedState.jobs = persistedState.jobs.map((job: any) => {
                if (!job.clientId && job.clientName) {
                  // Find matching client by name
                  const matchingClient = clients.find(
                    (c: any) => c.name.toLowerCase().trim() === job.clientName.toLowerCase().trim()
                  )
                  if (matchingClient) {
                    return { ...job, clientId: matchingClient.id }
                  }
                }
                return job
              })
            }
          } catch (error) {
            console.error('Failed to link jobs with clients:', error)
          }
        }
        return persistedState
      },
    }
  )
)
