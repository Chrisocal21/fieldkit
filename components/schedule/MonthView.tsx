'use client'

import { useState, useMemo } from 'react'
import { Job } from '@/store/jobStore'
import { useClientStore } from '@/store/clientStore'
import StatusBadge from '@/components/shared/StatusBadge'

interface MonthViewProps {
  jobs: Job[]
  onJobClick: (job: Job) => void
}

export default function MonthView({ jobs, onJobClick }: MonthViewProps) {
  const clients = useClientStore((state) => state.clients)
  const [currentDate, setCurrentDate] = useState(new Date())

  // Get first and last day of current month view
  const monthStart = useMemo(() => {
    const start = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    return start
  }, [currentDate])

  const monthEnd = useMemo(() => {
    const end = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
    return end
  }, [currentDate])

  // Get calendar grid (including days from prev/next month to fill weeks)
  const calendarDays = useMemo(() => {
    const days: Date[] = []
    const startDay = monthStart.getDay() // 0 = Sunday
    const daysInMonth = monthEnd.getDate()

    // Add days from previous month
    const prevMonthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth(), 0)
    for (let i = startDay - 1; i >= 0; i--) {
      days.push(new Date(prevMonthEnd.getFullYear(), prevMonthEnd.getMonth(), prevMonthEnd.getDate() - i))
    }

    // Add days of current month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i))
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length // 6 weeks × 7 days
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, i))
    }

    return days
  }, [currentDate, monthStart, monthEnd])

  // Group jobs by date
  const jobsByDate = useMemo(() => {
    const grouped = new Map<string, Job[]>()
    
    jobs.forEach(job => {
      if (!job.dueDate) return
      
      const date = new Date(job.dueDate)
      const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
      
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, [])
      }
      grouped.get(dateKey)!.push(job)
    })

    return grouped
  }, [jobs])

  const getJobsForDate = (date: Date) => {
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`
    return jobsByDate.get(dateKey) || []
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentDate(new Date())
  }

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {monthName}
        </h2>
        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
          >
            Today
          </button>
          <div className="flex items-center gap-1">
            <button
              onClick={goToPreviousMonth}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Previous month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={goToNextMonth}
              className="p-1.5 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
              aria-label="Next month"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Day Labels */}
      <div className="grid grid-cols-7 border-b border-gray-200 dark:border-gray-700">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div
            key={day}
            className="p-3 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7">
        {calendarDays.map((date, idx) => {
          const dayJobs = getJobsForDate(date)
          const isCurrentMonthDay = isCurrentMonth(date)
          const isTodayDate = isToday(date)

          return (
            <div
              key={idx}
              className={`min-h-[120px] border-r border-b border-gray-200 dark:border-gray-700 p-2 ${
                !isCurrentMonthDay ? 'bg-gray-50 dark:bg-gray-900/50' : 'bg-white dark:bg-gray-800'
              } ${idx % 7 === 6 ? 'border-r-0' : ''} ${
                idx >= calendarDays.length - 7 ? 'border-b-0' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`text-sm font-medium ${
                    isTodayDate
                      ? 'bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center'
                      : isCurrentMonthDay
                      ? 'text-gray-900 dark:text-white'
                      : 'text-gray-400 dark:text-gray-600'
                  }`}
                >
                  {date.getDate()}
                </span>
                {dayJobs.length > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {dayJobs.length}
                  </span>
                )}
              </div>

              {/* Jobs for this day */}
              <div className="space-y-1">
                {dayJobs.slice(0, 3).map(job => {
                  const client = clients.find(c => c.id === job.clientId)
                  
                  return (
                    <button
                      key={job.id}
                      onClick={() => onJobClick(job)}
                      className="w-full text-left px-2 py-1 rounded text-xs hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          job.status === 'Completed' ? 'bg-green-500' :
                          job.status === 'In Progress' ? 'bg-blue-500' :
                          job.status === 'Scheduled' ? 'bg-yellow-500' :
                          'bg-gray-400'
                        }`} />
                        <span className="font-medium text-gray-900 dark:text-white truncate">
                          {job.title}
                        </span>
                      </div>
                      {client && (
                        <p className="text-gray-500 dark:text-gray-400 truncate ml-3">
                          {client.name}
                        </p>
                      )}
                    </button>
                  )
                })}
                {dayJobs.length > 3 && (
                  <div className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400 font-medium">
                    +{dayJobs.length - 3} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-gray-400" />
            <span className="text-gray-600 dark:text-gray-400">Draft/Quoted</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-gray-600 dark:text-gray-400">Scheduled</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="text-gray-600 dark:text-gray-400">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-gray-600 dark:text-gray-400">Completed</span>
          </div>
        </div>
      </div>
    </div>
  )
}
