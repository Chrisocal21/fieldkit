import { JobStatus } from '@/store/jobStore'

type QuoteStatus = 'Draft' | 'Sent' | 'Accepted' | 'Declined' | 'Revised'

interface StatusBadgeProps {
  status: JobStatus | QuoteStatus
  className?: string
}

const neutral = {
  dot: 'bg-gray-400 dark:bg-gray-500',
  pill: 'bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border-gray-200 dark:border-gray-700',
}
const info = {
  dot: 'bg-blue-500 dark:bg-blue-400',
  pill: 'bg-blue-50 dark:bg-blue-400/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-400/30',
}
const success = {
  dot: 'bg-green-500 dark:bg-green-400',
  pill: 'bg-green-50 dark:bg-green-400/10 text-green-700 dark:text-green-300 border-green-200 dark:border-green-400/30',
}
const danger = {
  dot: 'bg-red-500 dark:bg-red-400',
  pill: 'bg-red-50 dark:bg-red-400/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-400/30',
}

const statusConfig: Record<JobStatus | QuoteStatus, { dot: string; pill: string }> = {
  'Draft': neutral,
  'Quoted': {
    dot: 'bg-gray-500 dark:bg-gray-300',
    pill: 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600',
  },
  'Scheduled': info,
  'In Progress': {
    dot: 'bg-amber-500 dark:bg-amber-400',
    pill: 'bg-amber-50 dark:bg-amber-400/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-400/30',
  },
  'Completed': success,
  'Cancelled': danger,
  // Quote-specific statuses
  'Sent': info,
  'Accepted': success,
  'Declined': danger,
  'Revised': {
    dot: 'bg-purple-500 dark:bg-purple-400',
    pill: 'bg-purple-50 dark:bg-purple-400/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-400/30',
  },
}

export default function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const config = statusConfig[status] ?? neutral

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border whitespace-nowrap ${config.pill} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} aria-hidden="true" />
      {status}
    </span>
  )
}
