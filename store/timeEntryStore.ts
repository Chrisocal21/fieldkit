import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { userScopedStorage } from '@/lib/userStorage'
import api from '@/lib/api'

export interface TimeEntry {
  id: string
  jobId: string // Link to job
  teamMemberId: string // Link to team member
  startTime: number // Unix timestamp
  endTime?: number // Unix timestamp (undefined if still ongoing)
  duration: number // Duration in minutes (calculated)
  notes?: string
  createdAt: number
  updatedAt: number
}

interface TimeEntryState {
  entries: TimeEntry[]
  addEntry: (entry: Omit<TimeEntry, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateEntry: (id: string, updates: Partial<TimeEntry>) => void
  deleteEntry: (id: string) => void
  getEntryById: (id: string) => TimeEntry | undefined
  getEntriesByJobId: (jobId: string) => TimeEntry[]
  getEntriesByMemberId: (memberId: string) => TimeEntry[]
  getActiveEntry: (jobId: string, memberId: string) => TimeEntry | undefined
  stopEntry: (id: string, endTime: number) => void
  calculateJobTotalHours: (jobId: string) => number
  calculateJobLaborCost: (jobId: string, hourlyRates: Map<string, number>) => number
}

export const useTimeEntryStore = create<TimeEntryState>()(
  persist(
    (set, get) => ({
      entries: [],

      addEntry: (entry) => {
        const id = nanoid()
        const now = Date.now()
        const newEntry: TimeEntry = {
          ...entry,
          id,
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          entries: [...state.entries, newEntry],
        }))
        api.timeEntries.create(newEntry)
        return id
      },

      updateEntry: (id, updates) => {
        set((state) => ({
          entries: state.entries.map((entry) =>
            entry.id === id
              ? { ...entry, ...updates, updatedAt: Date.now() }
              : entry
          ),
        }))
        api.timeEntries.update(id, { ...updates, updatedAt: Date.now() })
      },

      deleteEntry: (id) => {
        set((state) => ({
          entries: state.entries.filter((entry) => entry.id !== id),
        }))
        api.timeEntries.delete(id)
      },

      getEntryById: (id) => {
        return get().entries.find((entry) => entry.id === id)
      },

      getEntriesByJobId: (jobId) => {
        return get().entries.filter((entry) => entry.jobId === jobId)
      },

      getEntriesByMemberId: (memberId) => {
        return get().entries.filter((entry) => entry.teamMemberId === memberId)
      },

      getActiveEntry: (jobId, memberId) => {
        return get().entries.find(
          (entry) =>
            entry.jobId === jobId &&
            entry.teamMemberId === memberId &&
            !entry.endTime
        )
      },

      stopEntry: (id, endTime) => {
        const entry = get().getEntryById(id)
        if (!entry) return

        const duration = Math.round((endTime - entry.startTime) / 60000) // Convert to minutes
        get().updateEntry(id, { endTime, duration })
      },

      calculateJobTotalHours: (jobId) => {
        const entries = get().getEntriesByJobId(jobId)
        const totalMinutes = entries.reduce((sum, entry) => sum + entry.duration, 0)
        return totalMinutes / 60 // Convert to hours
      },

      calculateJobLaborCost: (jobId, hourlyRates) => {
        const entries = get().getEntriesByJobId(jobId)
        return entries.reduce((total, entry) => {
          const rate = hourlyRates.get(entry.teamMemberId) || 0
          const hours = entry.duration / 60
          return total + (hours * rate)
        }, 0)
      },
    }),
    {
      name: 'fieldkit-time-entries',
      storage: userScopedStorage,
      version: 1,
    }
  )
)
