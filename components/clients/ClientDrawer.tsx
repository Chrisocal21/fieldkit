'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Client } from '@/store/clientStore'
import { Job, useJobStore } from '@/store/jobStore'
import StatusBadge from '@/components/shared/StatusBadge'

interface ClientDrawerProps {
  client: Client | null
  isOpen: boolean
  onClose: () => void
  onEdit: (client: Client) => void
  onCreateJob?: () => void
}

export default function ClientDrawer({ client, isOpen, onClose, onEdit, onCreateJob }: ClientDrawerProps) {
  const router = useRouter()
  const { getJobsByClientId } = useJobStore()
  
  const [activeTab, setActiveTab] = useState<'details' | 'jobs'>('details')

  if (!isOpen || !client) return null

  const clientJobs = getJobsByClientId(client.id)
  const completedJobs = clientJobs.filter(j => j.status === 'Completed').length
  const activeJobs = clientJobs.filter(j => !['Completed', 'Cancelled'].includes(j.status)).length

  const handleJobClick = (job: Job) => {
    router.push(`/jobs?selected=${job.id}`)
    onClose()
  }

  const handleCallClient = () => {
    if (client.phone) {
      window.location.href = `tel:${client.phone}`
    }
  }

  const handleEmailClient = () => {
    if (client.email) {
      window.location.href = `mailto:${client.email}`
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 lg:hidden"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-gray-900 shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            {client.name}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setActiveTab('details')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'details'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Details
          </button>
          <button
            onClick={() => setActiveTab('jobs')}
            className={`flex-1 px-4 py-3 text-sm font-medium ${
              activeTab === 'jobs'
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            Jobs ({clientJobs.length})
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'details' && (
            <div className="space-y-6">
              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{clientJobs.length}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Total Jobs</div>
                </div>
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{activeJobs}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">Active Jobs</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                  Contact Information
                </h3>
                
                {client.email && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300 truncate">{client.email}</span>
                    </div>
                    <button
                      onClick={handleEmailClient}
                      className="ml-2 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title="Send email"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                )}

                {client.phone && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">{client.phone}</span>
                    </div>
                    <button
                      onClick={handleCallClient}
                      className="ml-2 p-1 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded"
                      title="Call client"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </button>
                  </div>
                )}

                {client.address && (
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-sm text-gray-700 dark:text-gray-300">{client.address}</span>
                  </div>
                )}
              </div>

              {/* Properties / Job Sites */}
              {client.properties && client.properties.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    Properties / Job Sites
                  </h3>
                  <div className="space-y-2">
                    {client.properties.map((prop) => (
                      <div key={prop.id} className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <div>
                          {prop.label && (
                            <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">{prop.label}</div>
                          )}
                          <div className="text-sm text-gray-700 dark:text-gray-300">{prop.address}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Notes */}
              {client.notes && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    Notes
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                    {client.notes}
                  </p>
                </div>
              )}

              {/* Tags */}
              {client.tags && client.tags.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wide">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {client.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'jobs' && (
            <div className="space-y-3">
              {clientJobs.length > 0 ? (
                clientJobs.map((job) => (
                  <button
                    key={job.id}
                    onClick={() => handleJobClick(job)}
                    className="w-full p-4 text-left bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-gray-900 dark:text-white">{job.title}</h4>
                      <StatusBadge status={job.status} />
                    </div>
                    {job.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {job.description}
                      </p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      {job.dueDate && (
                        <span>Due: {new Date(job.dueDate).toLocaleDateString()}</span>
                      )}
                      {job.quotes && job.quotes.length > 0 && (
                        <span>{job.quotes.length} quote{job.quotes.length !== 1 ? 's' : ''}</span>
                      )}
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 dark:text-gray-400 mb-4">No jobs for this client yet</p>
                  {onCreateJob && (
                    <button
                      onClick={onCreateJob}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Create First Job
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
          {onCreateJob && (
            <button
              onClick={onCreateJob}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Job
            </button>
          )}
          <button
            onClick={() => onEdit(client)}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            Edit Client
          </button>
        </div>
      </div>
    </>
  )
}
