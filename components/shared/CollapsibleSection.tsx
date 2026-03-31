'use client'

import { useState } from 'react'

interface CollapsibleSectionProps {
  title: string
  badge?: string | number
  icon?: React.ReactNode
  summary?: React.ReactNode
  children: React.ReactNode
  defaultExpanded?: boolean
  variant?: 'default' | 'alert'
}

export default function CollapsibleSection({
  title,
  badge,
  icon,
  summary,
  children,
  defaultExpanded = false,
  variant = 'default'
}: CollapsibleSectionProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const borderColor = variant === 'alert' 
    ? 'border-orange-200 dark:border-orange-800/50'
    : 'border-gray-200 dark:border-gray-700'

  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border ${borderColor} overflow-hidden`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-4 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && (
            <div className="flex-shrink-0">
              {icon}
            </div>
          )}
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
              {badge !== undefined && (
                <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 bg-slate-100 dark:bg-slate-700 rounded-full text-xs font-semibold text-slate-900 dark:text-slate-100">
                  {badge}
                </span>
              )}
            </div>
            {summary && !isExpanded && (
              <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                {summary}
              </div>
            )}
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700/50">
          <div className="pt-4">
            {children}
          </div>
        </div>
      )}
    </div>
  )
}
