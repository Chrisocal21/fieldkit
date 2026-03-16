'use client'

import { useState } from 'react'
import { Job, useJobStore } from '@/store/jobStore'
import { useTeamStore } from '@/store/teamStore'
import StatusBadge from '@/components/shared/StatusBadge'

interface DayViewProps {
  onJobClick?: (job: Job) => void
}

export default function DayView({ onJobClick }: DayViewProps) {
  const jobs = useJobStore((state) =>
    state.jobs.filter((job) => !job.archived && job.dueDate)
  )
  const updateJob = useJobStore((state) => state.updateJob)
  const members = useTeamStore((state) => state.members)

  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    return now
  })

  const [draggedJob, setDraggedJob] = useState<Job | null>(null)

  const navigateDay = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    newDate.setDate(currentDate.getDate() + (direction === 'next' ? 1 : -1))
    setCurrentDate(newDate)
  }

  const resetToToday = () => {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    setCurrentDate(now)
  }

  const getJobsForDate = () => {
    const startOfDay = new Date(currentDate).setHours(0, 0, 0, 0)
    const endOfDay = new Date(currentDate).setHours(23, 59, 59, 999)
    return jobs
      .filter((job) => job.dueDate && job.dueDate >= startOfDay && job.dueDate <= endOfDay)
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
  }

  const isToday = () => {
    const today = new Date()
    return (
      currentDate.getDate() === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    )
  }

  const dayJobs = getJobsForDate()

  // Generate time slots for the day (6 AM to 8 PM)
  const timeSlots = Array.from({ length: 15 }, (_, i) => i + 6) // 6 to 20 (8 PM)

  const getJobsForHour = (hour: number) => {
    return dayJobs.filter((job) => {
      if (!job.dueDate) return false
      const jobDate = new Date(job.dueDate)
      return jobDate.getHours() === hour
    })
  }

  const handleDragStart = (e: React.DragEvent, job: Job) => {
    setDraggedJob(job)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, hour: number) => {
    e.preventDefault()
    if (draggedJob) {
      const newDueDate = new Date(currentDate)
      newDueDate.setHours(hour, 0, 0, 0)
      updateJob(draggedJob.id, { dueDate: newDueDate.getTime() })
      setDraggedJob(null)
    }
  }

  return (
    <div>
      {/* Day Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {currentDate.toLocaleDateString('en-US', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            })}
          </h2>
          {isToday() && (
            <span className="text-xs px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded">
              Today
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={resetToToday}
            className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Today
          </button>
          <button
            onClick={() => navigateDay('prev')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateDay('next')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Day Summary */}
      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {dayJobs.length === 0 ? (
            'No jobs scheduled for this day'
          ) : (
            <>
              <span className="font-medium text-gray-900 dark:text-white">{dayJobs.length}</span> job
              {dayJobs.length !== 1 ? 's' : ''} scheduled
            </>
          )}
        </div>
      </div>

      {/* Time-based Schedule */}
      <div className="space-y-2">
        {timeSlots.map((hour) => {
          const hourJobs = getJobsForHour(hour)
          const timeLabel = new Date(2000, 0, 1, hour).toLocaleTimeString('en-US', {
            hour: 'numeric',
            hour12: true,
          })

          return (
            <div
              key={hour}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, hour)}
              className="flex gap-3 min-h-[60px]"
            >
              {/* Time label */}
              <div className="w-20 flex-shrink-0 text-sm text-gray-500 dark:text-gray-400 pt-1">
                {timeLabel}
              </div>

              {/* Jobs container */}
              <div className="flex-1 border-l-2 border-gray-200 dark:border-gray-700 pl-3 pb-2">
                {hourJobs.length === 0 ? (
                  <div className="h-full min-h-[40px] border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Drop here</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {hourJobs.map((job) => {
                      const assignee = members.find((m) => m.id === job.assigneeId)
                      return (
                        <div
                          key={job.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, job)}
                          onClick={() => onJobClick?.(job)}
                          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 cursor-move hover:shadow-md transition-shadow"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <StatusBadge status={job.status} />
                                <span className="text-xs text-gray-500 dark:text-gray-400">
                                  {job.id}
                                </span>
                              </div>
                              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                                {job.title}
                              </h3>
                              <p className="text-sm text-gray-600 dark:text-gray-300">
                                {job.clientName}
                              </p>
                              {assignee && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  Assigned to {assignee.name}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {new Date(job.dueDate!).toLocaleTimeString('en-US', {
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true,
                              })}
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
