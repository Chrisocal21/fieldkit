'use client'

import { useState } from 'react'
import { Job, useJobStore } from '@/store/jobStore'
import { useTeamStore } from '@/store/teamStore'
import StatusBadge from '@/components/shared/StatusBadge'

interface WeekViewProps {
  onJobClick?: (job: Job) => void
}

export default function WeekView({ onJobClick }: WeekViewProps) {
  const jobs = useJobStore((state) =>
    state.jobs.filter((job) => !job.archived && job.dueDate)
  )
  const updateJob = useJobStore((state) => state.updateJob)
  const members = useTeamStore((state) => state.members)

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Monday start
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday
  })

  const [draggedJob, setDraggedJob] = useState<Job | null>(null)

  // Number of weeks to display
  const weeksToShow = 4

  // Generate all days for multiple weeks
  const allDays = Array.from({ length: 7 * weeksToShow }, (_, i) => {
    const date = new Date(currentWeekStart)
    date.setDate(currentWeekStart.getDate() + i)
    return date
  })

  // Group days into weeks
  const weeks = []
  for (let i = 0; i < weeksToShow; i++) {
    weeks.push(allDays.slice(i * 7, (i + 1) * 7))
  }

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newStart = new Date(currentWeekStart)
    newStart.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 * weeksToShow : -7 * weeksToShow))
    setCurrentWeekStart(newStart)
  }

  const resetToToday = () => {
    const now = new Date()
    const dayOfWeek = now.getDay()
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    setCurrentWeekStart(monday)
  }

  const getJobsForDate = (date: Date) => {
    const startOfDay = new Date(date).setHours(0, 0, 0, 0)
    const endOfDay = new Date(date).setHours(23, 59, 59, 999)
    return jobs.filter(
      (job) => job.dueDate && job.dueDate >= startOfDay && job.dueDate <= endOfDay
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const handleDragStart = (e: React.DragEvent, job: Job) => {
    setDraggedJob(job)
    e.dataTransfer.effectAllowed = 'move'
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    if (draggedJob) {
      const newDueDate = new Date(date)
      if (draggedJob.dueDate) {
        const oldDate = new Date(draggedJob.dueDate)
        newDueDate.setHours(oldDate.getHours(), oldDate.getMinutes(), 0, 0)
      } else {
        newDueDate.setHours(9, 0, 0, 0) // Default to 9 AM
      }
      updateJob(draggedJob.id, { dueDate: newDueDate.getTime() })
      setDraggedJob(null)
    }
  }

  const formatMonthYear = () => {
    const lastDay = allDays[allDays.length - 1]
    if (currentWeekStart.getMonth() === lastDay.getMonth()) {
      return currentWeekStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
    return `${currentWeekStart.toLocaleDateString('en-US', { month: 'short' })} - ${lastDay.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}`
  }

  return (
    <div>
      {/* Week Navigation */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {formatMonthYear()}
          </h2>
          <button
            onClick={resetToToday}
            className="text-sm px-3 py-1 border border-gray-300 dark:border-gray-600 rounded text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Today
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateWeek('prev')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={() => navigateWeek('next')}
            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Calendar Grid - Multiple Weeks */}
      <div className="space-y-6">
        {weeks.map((weekDays, weekIndex) => (
          <div key={weekIndex}>
            {/* Week Label */}
            <div className="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">
              Week {weekIndex + 1}
            </div>

            {/* Days Grid */}
            <div className="grid grid-cols-7 gap-2 md:gap-3">
              {weekDays.map((date, idx) => {
                const dayJobs = getJobsForDate(date)
                const today = isToday(date)

                return (
                  <div
                    key={idx}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, date)}
                    className={`min-h-[120px] border rounded-lg p-2 ${
                      today
                        ? 'bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700'
                        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {/* Day Header */}
                    <div className="mb-2">
                      <div
                        className={`text-xs font-medium ${
                          today ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'
                        }`}
                      >
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                      <div
                        className={`text-lg font-semibold ${
                          today ? 'text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {date.getDate()}
                      </div>
                    </div>

                    {/* Jobs for this day */}
                    <div className="space-y-1.5">
                      {dayJobs.map((job) => {
                        const assignee = members.find((m) => m.id === job.assigneeId)
                        return (
                          <div
                            key={job.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, job)}
                            onClick={() => onJobClick?.(job)}
                            className={`p-2 rounded text-xs cursor-move hover:shadow-md transition-shadow ${
                              job.status === 'Quoted'
                                ? 'bg-gray-100 dark:bg-gray-700 border-l-2 border-gray-400'
                                : job.status === 'Scheduled'
                                ? 'bg-blue-100 dark:bg-blue-900/30 border-l-2 border-blue-500'
                                : job.status === 'In Progress'
                                ? 'bg-amber-100 dark:bg-amber-900/30 border-l-2 border-amber-500'
                                : job.status === 'Completed'
                                ? 'bg-green-100 dark:bg-green-900/30 border-l-2 border-green-500'
                                : 'bg-red-100 dark:bg-red-900/30 border-l-2 border-red-500'
                            }`}
                          >
                            <div className="font-medium text-gray-900 dark:text-white truncate mb-1">
                              {job.title}
                            </div>
                            <div className="text-gray-600 dark:text-gray-300 truncate">
                              {job.clientName}
                            </div>
                            {assignee && (
                              <div className="text-gray-500 dark:text-gray-400 truncate mt-1">
                                {assignee.name}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-400">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span>Quoted</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Scheduled</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-500 rounded"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-red-500 rounded"></div>
          <span>Cancelled</span>
        </div>
      </div>
    </div>
  )
}
