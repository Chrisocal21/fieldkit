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
          <p className="font-mono text-[11px] text-gray-500 dark:text-gray-400">{job.id}</p>
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
        <p className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-3">
          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{job.siteAddress}</span>
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
