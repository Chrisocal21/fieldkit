'use client'

import { useState } from 'react'
import { Job, useJobStore } from '@/store/jobStore'
import { useTeamStore } from '@/store/teamStore'
import StatusBadge from '@/components/shared/StatusBadge'

interface WeekViewProps {
  onJobClick?: (job: Job) => void
  assigneeFilter?: string
}

export default function WeekView({ onJobClick, assigneeFilter }: WeekViewProps) {
  const jobs = useJobStore((state) =>
    state.jobs.filter((job) => {
      if (job.archived || !job.dueDate) return false
      if (assigneeFilter && job.assigneeId !== assigneeFilter) return false
      return true
    })
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
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null)

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
    const dayStart = new Date(date).setHours(0, 0, 0, 0)
    const dayEnd = new Date(date).setHours(23, 59, 59, 999)
    return jobs.filter((job) => {
      if (!job.dueDate) return false
      const jobEnd = job.dueDate
      const jobStart = job.startDate ?? job.dueDate
      return jobStart <= dayEnd && jobEnd >= dayStart
    })
  }

  // Returns 'only' | 'start' | 'middle' | 'end' for multi-day span styling
  const getSpanPosition = (job: Job, date: Date): 'only' | 'start' | 'middle' | 'end' => {
    if (!job.startDate || !job.dueDate || job.startDate >= job.dueDate) return 'only'
    const dayStart = new Date(date).setHours(0, 0, 0, 0)
    const dayEnd = new Date(date).setHours(23, 59, 59, 999)
    const jobStartDay = new Date(job.startDate).setHours(0, 0, 0, 0)
    const jobEndDay = new Date(job.dueDate).setHours(0, 0, 0, 0)
    if (jobStartDay >= dayStart && jobStartDay <= dayEnd) return 'start'
    if (jobEndDay >= dayStart && jobEndDay <= dayEnd) return 'end'
    return 'middle'
  }

  const getDurationDays = (job: Job): number => {
    if (!job.startDate || !job.dueDate) return 1
    return Math.round((job.dueDate - job.startDate) / (1000 * 60 * 60 * 24)) + 1
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
    // Add ghost image styling
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5'
    }
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setDraggedJob(null)
    setDragOverDate(null)
    // Reset opacity
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1'
    }
  }

  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverDate(date)
  }

  const handleDragLeave = () => {
    setDragOverDate(null)
  }

  const handleDrop = (e: React.DragEvent, date: Date) => {
    e.preventDefault()
    if (draggedJob) {
      const newDueDate = new Date(date)
      if (draggedJob.dueDate) {
        const oldDate = new Date(draggedJob.dueDate)
        newDueDate.setHours(oldDate.getHours(), oldDate.getMinutes(), 0, 0)
      } else {
        newDueDate.setHours(9, 0, 0, 0)
      }
      // For multi-day jobs, shift startDate by the same offset to preserve duration
      const updates: Partial<Job> = { dueDate: newDueDate.getTime() }
      if (draggedJob.startDate && draggedJob.dueDate) {
        const duration = draggedJob.dueDate - draggedJob.startDate
        updates.startDate = newDueDate.getTime() - duration
      }
      updateJob(draggedJob.id, updates)
      setDraggedJob(null)
      setDragOverDate(null)
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
                const isDragOver = dragOverDate && 
                  dragOverDate.getDate() === date.getDate() &&
                  dragOverDate.getMonth() === date.getMonth() &&
                  dragOverDate.getFullYear() === date.getFullYear()

                return (
                  <div
                    key={idx}
                    onDragOver={(e) => handleDragOver(e, date)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, date)}
                    className={`min-h-[120px] border rounded-lg p-2 transition-all ${
                      isDragOver
                        ? 'bg-blue-100 dark:bg-blue-900/40 border-blue-500 dark:border-blue-400 border-2 scale-105 shadow-lg'
                        : today
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
                        const isDragging = draggedJob?.id === job.id
                        const spanPos = getSpanPosition(job, date)
                        const durationDays = getDurationDays(job)
                        const isSpanning = spanPos !== 'only'
                        const showFull = spanPos === 'only' || spanPos === 'start'

                        const statusColors = job.status === 'Quoted'
                          ? 'bg-gray-100 dark:bg-gray-700 border-l-2 border-gray-400'
                          : job.status === 'Scheduled'
                          ? 'bg-blue-100 dark:bg-blue-900/30 border-l-2 border-blue-500'
                          : job.status === 'In Progress'
                          ? 'bg-amber-100 dark:bg-amber-900/30 border-l-2 border-amber-500'
                          : job.status === 'Completed'
                          ? 'bg-green-100 dark:bg-green-900/30 border-l-2 border-green-500'
                          : 'bg-red-100 dark:bg-red-900/30 border-l-2 border-red-500'

                        const spanRounding = spanPos === 'start'
                          ? 'rounded-l rounded-r-none'
                          : spanPos === 'end'
                          ? 'rounded-r rounded-l-none'
                          : spanPos === 'middle'
                          ? 'rounded-none'
                          : 'rounded'

                        return (
                          <div
                            key={job.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, job)}
                            onDragEnd={handleDragEnd}
                            onClick={() => onJobClick?.(job)}
                            title={job.title}
                            className={`p-2 text-xs cursor-move hover:shadow-md transition-all ${spanRounding} ${statusColors} ${
                              isDragging ? 'opacity-50' : ''
                            }`}
                          >
                            {showFull ? (
                              <>
                                <div className="font-medium text-gray-900 dark:text-white truncate mb-1 flex items-center gap-1">
                                  {job.title}
                                  {isSpanning && (
                                    <span className="ml-auto text-[10px] font-normal text-gray-500 dark:text-gray-400 flex-shrink-0">
                                      {durationDays}d
                                    </span>
                                  )}
                                </div>
                                <div className="text-gray-600 dark:text-gray-300 truncate">
                                  {job.clientName}
                                </div>
                                {assignee && (
                                  <div className="text-gray-500 dark:text-gray-400 truncate mt-1">
                                    {assignee.name}
                                  </div>
                                )}
                              </>
                            ) : (
                              // Middle / end days: just a slim continuation bar
                              <div className="font-medium text-gray-700 dark:text-gray-300 truncate">
                                {spanPos === 'end' ? `↳ ${job.title}` : `· · ·`}
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
