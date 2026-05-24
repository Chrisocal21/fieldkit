'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Job, useJobStore } from '@/store/jobStore'
import { useTeamStore } from '@/store/teamStore'
import EmptyState from '@/components/shared/EmptyState'
import WeekView from '@/components/schedule/WeekView'
import DayView from '@/components/schedule/DayView'
import MonthView from '@/components/schedule/MonthView'

type ViewMode = 'month' | 'week' | 'day'

export default function SchedulePage() {
  const router = useRouter()
  const allJobs = useJobStore((state) => state.jobs)
  const members = useTeamStore((state) => state.members.filter((m) => m.active))

  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('month')
  const [selectedAssignee, setSelectedAssignee] = useState<string | null>(null)

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const jobs = mounted
    ? allJobs.filter((job) => {
        if (job.archived || !job.dueDate) return false
        if (selectedAssignee && job.assigneeId !== selectedAssignee) return false
        return true
      })
    : []

  const handleJobClick = (job: Job) => {
    router.push(`/jobs?id=${job.id}`)
  }

  if (!mounted) return null

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Visual calendar of upcoming work
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex rounded-md shadow-sm flex-shrink-0" role="group">
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 text-sm font-medium border rounded-l-md ${
              viewMode === 'month'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Month
          </button>
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 text-sm font-medium border-t border-b ${
              viewMode === 'week'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Week
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 text-sm font-medium border rounded-r-md ${
              viewMode === 'day'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Day
          </button>
        </div>
      </div>

      {/* Assignee Filter - only shown when team members exist */}
      {members.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setSelectedAssignee(null)}
            className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
              !selectedAssignee
                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
            }`}
          >
            All
          </button>
          {members.map((member) => (
            <button
              key={member.id}
              onClick={() => setSelectedAssignee(selectedAssignee === member.id ? null : member.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-sm rounded-full border transition-colors ${
                selectedAssignee === member.id
                  ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                style={{ backgroundColor: member.color || '#94a3b8' }}
              />
              {member.name}
            </button>
          ))}
        </div>
      )}

      {/* Empty state after filter */}
      {jobs.length === 0 ? (
        <EmptyState
          title={selectedAssignee ? 'No jobs for this crew member' : 'No scheduled jobs'}
          description={
            selectedAssignee
              ? 'Try selecting a different crew member or clearing the filter.'
              : 'Jobs with due dates will appear here. Add a due date to your jobs to see them on the schedule.'
          }
          action={
            selectedAssignee
              ? { label: 'Show all', onClick: () => setSelectedAssignee(null) }
              : { label: 'Go to Jobs', onClick: () => router.push('/jobs') }
          }
        />
      ) : viewMode === 'month' ? (
        <MonthView jobs={jobs} onJobClick={handleJobClick} />
      ) : viewMode === 'week' ? (
        <WeekView onJobClick={handleJobClick} assigneeFilter={selectedAssignee ?? undefined} />
      ) : (
        <DayView onJobClick={handleJobClick} assigneeFilter={selectedAssignee ?? undefined} />
      )}
    </div>
  )
}

