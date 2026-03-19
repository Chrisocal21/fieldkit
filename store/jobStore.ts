import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { Quote } from './quoteStore'

export type JobStatus = 'Draft' | 'Quoted' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'

export interface Job {
  id: string
  title: string
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
  // Quote management within jobs
  addQuoteToJob: (jobId: string, quoteData: Omit<Quote, 'id' | 'quoteNumber' | 'jobId' | 'createdAt' | 'updatedAt'>) => void
  updateJobQuote: (jobId: string, quoteId: string, updates: Partial<Quote>) => void
  acceptJobQuote: (jobId: string, quoteId: string) => void
  deleteJobQuote: (jobId: string, quoteId: string) => void
  getJobQuotes: (jobId: string) => Quote[]
}

// Mock data
const mockJobs: Job[] = [
  {
    id: 'JOB-0001',
    title: 'Custom laser engraving - wedding signs',
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@example.com',
    clientPhone: '(555) 123-4567',
    siteAddress: '123 Venue Street, City, ST 12345',
    description: '3 wooden welcome signs with custom text',
    status: 'In Progress',
    assigneeId: 'TEAM-001',
    startDate: Date.now() - 86400000,
    dueDate: Date.now() + 86400000 * 2, // 2 days from now
    notes: 'Client wants walnut finish',
    quotes: [
      {
        id: 'QUOTE-0001',
        quoteNumber: 1001,
        jobId: 'JOB-0001',
        clientName: 'Sarah Johnson',
        clientEmail: 'sarah@example.com',
        clientPhone: '(555) 123-4567',
        notes: 'Wedding signs, walnut finish',
        taxRate: 0.08,
        status: 'Accepted',
        lineItems: [
          {
            id: 'LINE-0001',
            quoteId: 'QUOTE-0001',
            description: 'Walnut wood boards (3)',
            quantity: 3,
            unitPrice: 45.00,
            type: 'material',
            sortOrder: 0,
          },
          {
            id: 'LINE-0002',
            quoteId: 'QUOTE-0001',
            description: 'Laser engraving & finishing',
            quantity: 3,
            unitPrice: 75.00,
            type: 'labor',
            sortOrder: 1,
          },
        ],
        createdAt: Date.now() - 86400000 * 3,
        updatedAt: Date.now() - 86400000 * 2,
      },
    ],
    archived: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  },
  {
    id: 'JOB-0002',
    title: 'Print shop order - business cards',
    clientName: 'Mike\'s Auto Repair',
    clientEmail: 'mike@autoshop.com',
    clientPhone: '(555) 987-6543',
    description: '500 business cards, full color, glossy finish',
    status: 'Scheduled',
    assigneeId: 'TEAM-002',
    startDate: Date.now() + 86400000 * 3,
    dueDate: Date.now() + 86400000 * 5,
    notes: 'Rush order - need by Friday',
    quotes: [],
    archived: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'JOB-0003',
    title: 'Acrylic signage',
    clientName: 'Downtown Coffee Co.',
    clientEmail: 'info@downtowncoffee.com',
    siteAddress: '456 Main St, City, ST 12345',
    description: 'Large outdoor sign with LED backlighting',
    status: 'Quoted',
    dueDate: Date.now() + 86400000 * 10,
    notes: 'Waiting on client approval',
    quotes: [
      {
        id: 'QUOTE-0002',
        quoteNumber: 1002,
        jobId: 'JOB-0003',
        clientName: 'Downtown Coffee Co.',
        clientEmail: 'info@downtowncoffee.com',
        notes: 'LED backlighting, weatherproof materials',
        taxRate: 0.08,
        expiryDate: Date.now() + 86400000 * 7, // Expires in 7 days
        status: 'Sent',
        lineItems: [
          {
            id: 'LINE-0003',
            quoteId: 'QUOTE-0002',
            description: 'Acrylic sheet (24" x 36")',
            quantity: 1,
            unitPrice: 150.00,
            type: 'material',
            sortOrder: 0,
          },
          {
            id: 'LINE-0004',
            quoteId: 'QUOTE-0002',
            description: 'LED strip lighting kit',
            quantity: 1,
            unitPrice: 85.00,
            type: 'material',
            sortOrder: 1,
          },
          {
            id: 'LINE-0005',
            quoteId: 'QUOTE-0002',
            description: 'Design, fabrication & installation',
            quantity: 8,
            unitPrice: 75.00,
            type: 'labor',
            sortOrder: 2,
          },
        ],
        createdAt: Date.now() - 86400000,
        updatedAt: Date.now() - 86400000,
      },
    ],
    archived: false,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now(),
  },
]

export const useJobStore = create<JobState>()(
  persist(
    (set, get) => ({
      jobs: mockJobs,
      
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
      },
      
      updateJob: (id, updates) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, ...updates, updatedAt: Date.now() } : job
          ),
        }))
      },
      
      archiveJob: (id) => {
        set((state) => ({
          jobs: state.jobs.map((job) =>
            job.id === id ? { ...job, archived: true, updatedAt: Date.now() } : job
          ),
        }))
      },
      
      getJobById: (id) => {
        return get().jobs.find((job) => job.id === id)
      },
      
      // Quote management within jobs
      addQuoteToJob: (jobId, quoteData) => {
        set((state) => ({
          jobs: state.jobs.map((job) => {
            if (job.id === jobId) {
              // Ensure quotes array exists
              const jobQuotes = job.quotes || []
              
              // Get highest quote number across all jobs
              const allQuotes = state.jobs.flatMap(j => j.quotes || [])
              const maxQuoteNumber = allQuotes.length > 0 
                ? Math.max(...allQuotes.map(q => q.quoteNumber)) 
                : 1000
              
              const newQuote: Quote = {
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
                status: job.status === 'Draft' ? 'Quoted' : job.status,  // Auto-update to Quoted if Draft
                updatedAt: Date.now(),
              }
            }
            return job
          }),
        }))
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
      },
      
      acceptJobQuote: (jobId, quoteId) => {
        set((state) => ({
          jobs: state.jobs.map((job) => {
            if (job.id === jobId && job.quotes) {
              // Check if there's already an accepted quote
              const hasAcceptedQuote = job.quotes.some(
                q => q.id !== quoteId && q.status === 'Accepted'
              )
              
              if (hasAcceptedQuote) {
                console.warn('Job already has an accepted quote. Declining other quotes.')
              }
              
              return {
                ...job,
                status: 'Scheduled',  // Auto-update job status when quote is accepted
                quotes: job.quotes.map((quote) => {
                  if (quote.id === quoteId) {
                    return { ...quote, status: 'Accepted' as const, updatedAt: Date.now() }
                  }
                  // Auto-decline other quotes when one is accepted
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
      },
      
      getJobQuotes: (jobId) => {
        const job = get().jobs.find((j) => j.id === jobId)
        return job?.quotes || []
      },
    }),
    {
      name: 'fieldkit-jobs',
      version: 1,
      migrate: (persistedState: any, version: number) => {
        // Ensure all jobs have a quotes array (added in Phase 6.5)
        if (persistedState && persistedState.jobs) {
          persistedState.jobs = persistedState.jobs.map((job: any) => ({
            ...job,
            quotes: job.quotes || [], // Initialize quotes array if missing
          }))
        }
        return persistedState
      },
    }
  )
)
