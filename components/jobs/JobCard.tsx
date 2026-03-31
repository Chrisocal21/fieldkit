'use client'

import { Job } from '@/store/jobStore'
import { useTeamStore } from '@/store/teamStore'
import StatusBadge from '@/components/shared/StatusBadge'

interface JobCardProps {
  job: Job
  onClick: (job: Job) => void
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const members = useTeamStore((state) => state.members)
  const assignee = members.find((m) => m.id === job.assigneeId)

  return (
    <div
      onClick={() => onClick(job)}
      className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs text-gray-500 dark:text-gray-400">{job.id}</p>
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mt-1 truncate">
            {job.title}
          </h3>
        </div>
        <StatusBadge status={job.status} className="ml-2 flex-shrink-0" />
      </div>
      
      <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
        {job.clientName}
      </p>
      
      {job.siteAddress && (
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 truncate">
          📍 {job.siteAddress}
        </p>
      )}
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-3">
        {assignee && (
          <div className="flex items-center gap-1.5 truncate">
            <div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ backgroundColor: assignee.color }}
            />
            <span className="truncate">{assignee.name}</span>
          </div>
        )}
        {job.dueDate && (
          <span className="ml-auto">
            {new Date(job.dueDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        )}
      </div>
    </div>
  )
}
