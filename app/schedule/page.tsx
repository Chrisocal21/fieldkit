'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Job, useJobStore } from '@/store/jobStore'
import EmptyState from '@/components/shared/EmptyState'
import WeekView from '@/components/schedule/WeekView'
import DayView from '@/components/schedule/DayView'

type ViewMode = 'week' | 'day'

export default function SchedulePage() {
  const router = useRouter()
  const allJobs = useJobStore((state) => state.jobs)

  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('week')

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const jobs = mounted
    ? allJobs.filter((job) => !job.archived && job.dueDate)
    : []

  const handleJobClick = (job: Job) => {
    router.push(`/jobs?id=${job.id}`)
  }

  if (jobs.length === 0) {
    return (
      <EmptyState
        title="No scheduled jobs"
        description="Jobs with due dates will appear here. Add a due date to your jobs to see them on the schedule."
        action={{
          label: 'Go to Jobs',
          onClick: () => router.push('/jobs'),
        }}
      />
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Schedule</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Visual calendar of upcoming work
          </p>
        </div>

        {/* View Toggle */}
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 text-sm font-medium border rounded-l-md ${
              viewMode === 'week'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <svg
              className="w-4 h-4 inline mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            Week
          </button>
          <button
            onClick={() => setViewMode('day')}
            className={`px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-md ${
              viewMode === 'day'
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
            }`}
          >
            <svg
              className="w-4 h-4 inline mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            Day
          </button>
        </div>
      </div>

      {/* View Content */}
      {viewMode === 'week' ? (
        <WeekView onJobClick={handleJobClick} />
      ) : (
        <DayView onJobClick={handleJobClick} />
      )}
    </div>
  )
}

