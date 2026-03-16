import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export type JobStatus = 'Quoted' | 'Scheduled' | 'In Progress' | 'Completed' | 'Cancelled'

export interface Job {
  id: string
  title: string
  clientName: string
  description: string
  status: JobStatus
  assigneeId?: string
  dueDate?: number
  quoteId?: string
  notes: string
  archived: boolean
  createdAt: number
  updatedAt: number
}

interface JobState {
  jobs: Job[]
  addJob: (job: Omit<Job, 'id' | 'createdAt' | 'updatedAt' | 'archived'>) => void
  updateJob: (id: string, updates: Partial<Job>) => void
  archiveJob: (id: string) => void
  getJobById: (id: string) => Job | undefined
}

// Mock data
const mockJobs: Job[] = [
  {
    id: 'JOB-0001',
    title: 'Custom laser engraving - wedding signs',
    clientName: 'Sarah Johnson',
    description: '3 wooden welcome signs with custom text',
    status: 'In Progress',
    assigneeId: 'TEAM-001',
    dueDate: Date.now() + 86400000 * 2, // 2 days from now
    notes: 'Client wants walnut finish',
    archived: false,
    createdAt: Date.now() - 86400000 * 3,
    updatedAt: Date.now(),
  },
  {
    id: 'JOB-0002',
    title: 'Print shop order - business cards',
    clientName: 'Mike\'s Auto Repair',
    description: '500 business cards, full color, glossy finish',
    status: 'Scheduled',
    assigneeId: 'TEAM-002',
    dueDate: Date.now() + 86400000 * 5,
    notes: 'Rush order - need by Friday',
    archived: false,
    createdAt: Date.now() - 86400000 * 2,
    updatedAt: Date.now(),
  },
  {
    id: 'JOB-0003',
    title: 'Acrylic signage',
    clientName: 'Downtown Coffee Co.',
    description: 'Large outdoor sign with LED backlighting',
    status: 'Quoted',
    dueDate: Date.now() + 86400000 * 10,
    notes: 'Waiting on client approval',
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
    }),
    {
      name: 'fieldkit-jobs',
    }
  )
)
