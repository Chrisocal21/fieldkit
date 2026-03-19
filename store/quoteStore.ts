import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export interface QuoteLineItem {
  id: string
  quoteId: string
  description: string
  quantity: number
  unitPrice: number
  type: 'material' | 'labor' | 'other'
  sortOrder: number
}

export interface Quote {
  id: string
  quoteNumber: number
  jobId: string  // Required - quotes belong to a job
  clientName: string
  clientEmail?: string
  clientPhone?: string
  notes: string
  taxRate: number
  expiryDate?: number
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Revised'
  lineItems: QuoteLineItem[]
  createdAt: number
  updatedAt: number
}

interface QuoteState {
  quotes: Quote[]  // Legacy - kept for migration purposes, should be empty in new architecture
  // Note: Most quote operations now happen through jobStore
  // These helpers are for cross-job quote queries (e.g., /quotes overview page)
  getAllQuotes: () => Quote[]
  getQuoteById: (id: string) => Quote | undefined
  getQuotesByJobId: (jobId: string) => Quote[]
  updateQuote: (id: string, updates: Partial<Quote>) => void  // Syncs with jobStore
}

// No mock quotes - quotes now live within jobs
const mockQuotes: Quote[] = []

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      quotes: mockQuotes,  // Legacy storage
      
      // Get all quotes from all jobs (for /quotes overview page)
      getAllQuotes: () => {
        // Import jobStore dynamically to avoid circular dependency
        const { useJobStore } = require('./jobStore')
        const jobs = useJobStore.getState().jobs
        return jobs.flatMap((job: any) => job.quotes || []).filter(Boolean)
      },
      
      getQuoteById: (id) => {
        // Search through all jobs' quotes
        const { useJobStore } = require('./jobStore')
        const jobs = useJobStore.getState().jobs
        for (const job of jobs as any[]) {
          if (!job.quotes) continue
          const quote = job.quotes.find((q: any) => q.id === id)
          if (quote) return quote
        }
        return undefined
      },
      
      getQuotesByJobId: (jobId) => {
        const { useJobStore } = require('./jobStore')
        return useJobStore.getState().getJobQuotes(jobId)
      },
      
      // Update quote and sync with jobStore
      updateQuote: (id, updates) => {
        const { useJobStore } = require('./jobStore')
        const jobs = useJobStore.getState().jobs
        
        // Find which job contains this quote
        for (const job of jobs as any[]) {
          if (!job.quotes) continue
          const quote = job.quotes.find((q: any) => q.id === id)
          if (quote) {
            useJobStore.getState().updateJobQuote(job.id, id, updates)
            break
          }
        }
      },
    }),
    {
      name: 'fieldkit-quotes',
    }
  )
)
