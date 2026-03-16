'use client'

import { useState, useEffect } from 'react'
import { Job, JobStatus, useJobStore } from '@/store/jobStore'
import { useTeamStore } from '@/store/teamStore'
import StatusBadge from '@/components/shared/StatusBadge'

interface JobDrawerProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
}

export default function JobDrawer({ job, isOpen, onClose }: JobDrawerProps) {
  const updateJob = useJobStore((state) => state.updateJob)
  const archiveJob = useJobStore((state) => state.archiveJob)
  const members = useTeamStore((state) => state.members)

  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState<Partial<Job>>({})

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        clientName: job.clientName,
        description: job.description,
        status: job.status,
        assigneeId: job.assigneeId,
        dueDate: job.dueDate,
        notes: job.notes,
      })
    }
  }, [job])

  if (!isOpen || !job) return null

  const handleSave = () => {
    updateJob(job.id, formData)
    setIsEditing(false)
  }

  const handleArchive = () => {
    if (confirm('Archive this job? You can view archived jobs later.')) {
      archiveJob(job.id)
      onClose()
    }
  }

  const assignee = members.find((m) => m.id === job.assigneeId)

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Drawer */}
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
          <div className="w-screen max-w-md">
            <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-gray-800 shadow-xl">
              {/* Header */}
              <div className="px-4 py-6 sm:px-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      {job.id}
                    </p>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full text-lg font-medium px-2 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                        {job.title}
                      </h2>
                    )}
                  </div>
                  <button
                    onClick={onClose}
                    className="ml-3 text-gray-400 hover:text-gray-500"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 py-6 sm:px-6">
                <div className="space-y-6">
                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Status
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as JobStatus })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="Quoted">Quoted</option>
                        <option value="Scheduled">Scheduled</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    ) : (
                      <StatusBadge status={job.status} />
                    )}
                  </div>

                  {/* Client */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Client
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={formData.clientName}
                        onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">{job.clientName}</p>
                    )}
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300">
                        {job.description || 'No description'}
                      </p>
                    )}
                  </div>

                  {/* Assignee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Assigned To
                    </label>
                    {isEditing ? (
                      <select
                        value={formData.assigneeId || ''}
                        onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value || undefined })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      >
                        <option value="">Unassigned</option>
                        {members.map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {assignee ? assignee.name : 'Unassigned'}
                      </p>
                    )}
                  </div>

                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Due Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : ''}
                        onChange={(e) => setFormData({ 
                          ...formData, 
                          dueDate: e.target.value ? new Date(e.target.value).getTime() : undefined 
                        })}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-900 dark:text-white">
                        {job.dueDate
                          ? new Date(job.dueDate).toLocaleDateString()
                          : 'No due date'}
                      </p>
                    )}
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Notes
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {job.notes || 'No notes'}
                      </p>
                    )}
                  </div>

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Created: {new Date(job.createdAt).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Updated: {new Date(job.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 px-4 py-4 sm:px-6">
                {isEditing ? (
                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setIsEditing(false)
                        setFormData({
                          title: job.title,
                          clientName: job.clientName,
                          description: job.description,
                          status: job.status,
                          assigneeId: job.assigneeId,
                          dueDate: job.dueDate,
                          notes: job.notes,
                        })
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Save Changes
                    </button>
                  </div>
                ) : (
                  <div className="flex gap-3">
                    <button
                      onClick={handleArchive}
                      className="px-4 py-2 border border-red-300 dark:border-red-600 text-red-600 dark:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      Archive
                    </button>
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      Edit Job
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
