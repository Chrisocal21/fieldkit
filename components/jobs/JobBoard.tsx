'use client'

import { useState } from 'react'
import { Job, JobStatus, useJobStore } from '@/store/jobStore'
import { useTeamStore } from '@/store/teamStore'
import { useBoardSettingsStore } from '@/store/boardSettingsStore'
import BoardSettingsModal from './BoardSettingsModal'

interface JobBoardProps {
  onJobClick: (job: Job) => void
}

export default function JobBoard({ onJobClick }: JobBoardProps) {
  const jobs = useJobStore((state) => state.jobs.filter((job) => !job.archived))
  const updateJob = useJobStore((state) => state.updateJob)
  const members = useTeamStore((state) => state.members)
  const columns = useBoardSettingsStore((state) => state.columns)
  const [showSettings, setShowSettings] = useState(false)
  const [draggedJob, setDraggedJob] = useState<Job | null>(null)
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null)

  const getJobsByStatus = (status: string) => {
    return jobs.filter((job) => job.status === status)
  }

  const handleStatusChange = (job: Job, newStatus: string) => {
    updateJob(job.id, { status: newStatus as JobStatus })
  }

  const handleDragStart = (e: React.DragEvent, job: Job) => {
    setDraggedJob(job)
    e.dataTransfer.effectAllowed = 'move'
    e.dataTransfer.setData('text/html', e.currentTarget.innerHTML)
  }

  const handleDragEnd = () => {
    setDraggedJob(null)
    setDragOverColumn(null)
  }

  const handleDragOver = (e: React.DragEvent, columnStatus: string) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
    setDragOverColumn(columnStatus)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if we're leaving the column entirely
    if (e.currentTarget === e.target) {
      setDragOverColumn(null)
    }
  }

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault()
    if (draggedJob && draggedJob.status !== newStatus) {
      handleStatusChange(draggedJob, newStatus)
    }
    setDraggedJob(null)
    setDragOverColumn(null)
  }

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 h-[calc(100vh-220px)] min-h-[500px]">
        {columns.sort((a, b) => a.order - b.order).map((column) => {
        const columnJobs = getJobsByStatus(column.status)
        
        return (
          <div
            key={column.id}
            className={`flex-shrink-0 w-72 bg-gray-50 dark:bg-gray-900 rounded-lg p-3 flex flex-col h-full transition-colors ${
              dragOverColumn === column.status ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20' : ''
            }`}
            onDragOver={(e) => handleDragOver(e, column.status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, column.status)}
          >
            <div className="flex items-center justify-between mb-3 flex-shrink-0">
              <h3 className="font-medium text-sm text-gray-900 dark:text-white">
                {column.label}
              </h3>
              <span className="text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-gray-800 px-2 py-0.5 rounded">
                {columnJobs.length}
              </span>
            </div>

            <div className="space-y-2.5 overflow-y-auto flex-1 pr-1">
              {columnJobs.map((job) => {
                const assignee = members.find((m) => m.id === job.assigneeId)
                
                return (
                  <div
                    key={job.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, job)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onJobClick(job)}
                    className={`bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2.5 cursor-move hover:shadow-md transition-shadow ${
                      draggedJob?.id === job.id ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="mb-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">
                        {job.id}
                      </p>
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white line-clamp-2">
                        {job.title}
                      </h4>
                    </div>

                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {job.clientName}
                    </p>

                    <div className="flex items-center justify-between text-xs mb-2">
                      {assignee && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {assignee.name}
                        </span>
                      )}
                      {job.dueDate && (
                        <span className="text-gray-500 dark:text-gray-400">
                          {new Date(job.dueDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>

                    {/* Quick status change */}
                    <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
                      <select
                        value={job.status}
                        onChange={(e) => {
                          e.stopPropagation()
                          handleStatusChange(job, e.target.value)
                        }}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full text-xs px-2 py-1 border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        {columns.sort((a, b) => a.order - b.order).map((col) => (
                          <option key={col.id} value={col.status}>
                            {col.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )
              })}

              {columnJobs.length === 0 && (
                <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-600">
                  No jobs
                </div>
              )}
            </div>
          </div>
        )
      })}

        {/* Add Column Button */}
        <div className="flex-shrink-0 w-72">
          <button
            onClick={() => setShowSettings(true)}
            className="w-full h-full min-h-[200px] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors flex flex-col items-center justify-center gap-2 text-gray-500 dark:text-gray-400"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="text-sm font-medium">Customize Columns</span>
          </button>
        </div>
      </div>

      <BoardSettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}
