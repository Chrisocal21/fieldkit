'use client'

import { useState, useEffect } from 'react'
import { Job, useJobStore } from '@/store/jobStore'
import EmptyState from '@/components/shared/EmptyState'
import JobBoard from '@/components/jobs/JobBoard'
import JobList from '@/components/jobs/JobList'
import CreateJobModal from '@/components/jobs/CreateJobModal'
import JobDrawer from '@/components/jobs/JobDrawer'

type ViewMode = 'list' | 'board'

export default function JobsPage() {
  const allJobs = useJobStore((state) => state.jobs)
  
  const [mounted, setMounted] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('board')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState<Job | null>(null)

  // Prevent hydration mismatch by waiting for client-side mount
  useEffect(() => {
    setMounted(true)
  }, [])

  const jobs = mounted ? allJobs.filter((job) => !job.archived) : []

  const handleJobClick = (job: Job) => {
    setSelectedJob(job)
  }

  if (jobs.length === 0) {
    return (
      <>
        <EmptyState
          title="No jobs yet"
          description="Create your first job to start tracking work orders and projects."
          action={{
            label: 'Create Job',
            onClick: () => setIsCreateModalOpen(true),
          }}
        />
        <CreateJobModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
        />
      </>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Jobs</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Track work orders from creation to completion
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="hidden sm:flex border border-gray-300 dark:border-gray-600 rounded-lg p-1">
            <button
              onClick={() => setViewMode('board')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'board'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
              </svg>
              Board
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List
            </button>
          </div>

          {/* Create Button */}
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Job
          </button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'board' ? (
        <JobBoard onJobClick={handleJobClick} />
      ) : (
        <JobList jobs={jobs} onJobClick={handleJobClick} />
      )}

      {/* Modals */}
      <CreateJobModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
      <JobDrawer
        job={selectedJob}
        isOpen={!!selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </div>
  )
}
