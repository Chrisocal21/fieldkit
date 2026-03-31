'use client'

import { useState, useEffect } from 'react'
import { Job, JobStatus, useJobStore } from '@/store/jobStore'
import { useTeamStore } from '@/store/teamStore'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useMaterialCostStore } from '@/store/materialCostStore'
import { useExpenseStore } from '@/store/expenseStore'
import StatusBadge from '@/components/shared/StatusBadge'
import { JobQuotesTab } from './JobQuotesTab'
import TimeLog from './TimeLog'
import InvoicesTab from './InvoicesTab'
import MaterialsTab from './MaterialsTab'
import ExpensesTab from './ExpensesTab'

interface JobDrawerProps {
  job: Job | null
  isOpen: boolean
  onClose: () => void
}

type TabType = 'details' | 'quotes' | 'invoices' | 'materials' | 'expenses' | 'time' | 'notes'

export default function JobDrawer({ job, isOpen, onClose }: JobDrawerProps) {
  const updateJob = useJobStore((state) => state.updateJob)
  const archiveJob = useJobStore((state) => state.archiveJob)
  const members = useTeamStore((state) => state.members)
  const getInvoicesByJobId = useInvoiceStore((state) => state.getInvoicesByJobId)
  const getJobMaterialsByJobId = useMaterialCostStore((state) => state.getJobMaterialsByJobId)
  const getExpensesByJobId = useExpenseStore((state) => state.getExpensesByJobId)

  const [isEditing, setIsEditing] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('details')
  const [formData, setFormData] = useState<Partial<Job>>({})

  useEffect(() => {
    if (job) {
      setFormData({
        title: job.title,
        clientName: job.clientName,
        clientEmail: job.clientEmail,
        clientPhone: job.clientPhone,
        siteAddress: job.siteAddress,
        description: job.description,
        status: job.status,
        assigneeId: job.assigneeId,
        startDate: job.startDate,
        dueDate: job.dueDate,
        notes: job.notes,
      })
      setActiveTab('details')
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
        <div className="fixed inset-y-0 right-0 flex max-w-full pl-4 sm:pl-10">
          <div className="w-screen max-w-full sm:max-w-md lg:max-w-lg">
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

              {/* Tabs */}
              <div className="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
                <nav className="flex -mb-px px-4 sm:px-6 min-w-max sm:min-w-0">
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`py-3 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'details'
                        ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab('quotes')}
                    className={`py-3 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'quotes'
                        ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    Quotes
                    {job.quotes && job.quotes.length > 0 && (
                      <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                        {job.quotes.length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('invoices')}
                    className={`py-3 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'invoices'
                        ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    Invoices
                    {job && getInvoicesByJobId(job.id).length > 0 && (
                      <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                        {getInvoicesByJobId(job.id).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('materials')}
                    className={`py-3 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'materials'
                        ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    Materials
                    {job && getJobMaterialsByJobId(job.id).length > 0 && (
                      <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                        {getJobMaterialsByJobId(job.id).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className={`py-3 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'expenses'
                        ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    Expenses
                    {job && getExpensesByJobId(job.id).length > 0 && (
                      <span className="ml-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded-full text-xs">
                        {getExpensesByJobId(job.id).length}
                      </span>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab('time')}
                    className={`py-3 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'time'
                        ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    Time
                  </button>
                  <button
                    onClick={() => setActiveTab('notes')}
                    className={`py-3 px-3 sm:px-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                      activeTab === 'notes'
                        ? 'border-blue-600 text-blue-600 dark:border-blue-500 dark:text-blue-500'
                        : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300'
                    }`}
                  >
                    Notes
                  </button>
                </nav>
              </div>

              {/* Content */}
              <div className="flex-1 px-4 py-6 sm:px-6 overflow-y-auto">
                {/* Details Tab */}
                {activeTab === 'details' && (
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
                          <option value="Draft">Draft</option>
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

                    {/* Client Name */}
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

                    {/* Client Email & Phone */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Email
                        </label>
                        {isEditing ? (
                          <input
                            type="email"
                            value={formData.clientEmail || ''}
                            onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white text-sm">
                            {job.clientEmail || '—'}
                          </p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Phone
                        </label>
                        {isEditing ? (
                          <input
                            type="tel"
                            value={formData.clientPhone || ''}
                            onChange={(e) => setFormData({ ...formData, clientPhone: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white text-sm">
                            {job.clientPhone || '—'}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Site Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Site/Job Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.siteAddress || ''}
                          onChange={(e) => setFormData({ ...formData, siteAddress: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        />
                      ) : (
                        <p className="text-gray-900 dark:text-white">
                          {job.siteAddress || '—'}
                        </p>
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
                          {members.filter(m => m.active).map((member) => (
                            <option key={member.id} value={member.id}>
                              {member.name} ({member.role})
                            </option>
                          ))}
                        </select>
                      ) : (
                        <div className="flex items-center gap-2">
                          {assignee ? (
                            <>
                              <div
                                className="w-3 h-3 rounded-full flex-shrink-0"
                                style={{ backgroundColor: assignee.color }}
                              />
                              <span className="text-gray-900 dark:text-white">
                                {assignee.name}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                ({assignee.role})
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-500 dark:text-gray-400">Unassigned</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Start & Due Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Start Date
                        </label>
                        {isEditing ? (
                          <input
                            type="date"
                            value={formData.startDate ? new Date(formData.startDate).toISOString().split('T')[0] : ''}
                            onChange={(e) => setFormData({ 
                              ...formData, 
                              startDate: e.target.value ? new Date(e.target.value).getTime() : undefined 
                            })}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          />
                        ) : (
                          <p className="text-gray-900 dark:text-white text-sm">
                            {job.startDate ? new Date(job.startDate).toLocaleDateString() : '—'}
                          </p>
                        )}
                      </div>
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
                          <p className="text-gray-900 dark:text-white text-sm">
                            {job.dueDate ? new Date(job.dueDate).toLocaleDateString() : '—'}
                          </p>
                        )}
                      </div>
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
                )}

                {/* Quotes Tab */}
                {activeTab === 'quotes' && (
                  <JobQuotesTab job={job} />
                )}

                {/* Invoices Tab */}
                {activeTab === 'invoices' && (
                  <InvoicesTab jobId={job.id} />
                )}

                {/* Materials Tab */}
                {activeTab === 'materials' && (
                  <MaterialsTab jobId={job.id} />
                )}

                {/* Expenses Tab */}
                {activeTab === 'expenses' && (
                  <ExpensesTab jobId={job.id} />
                )}

                {/* Time Tab */}
                {activeTab === 'time' && (
                  <TimeLog jobId={job.id} />
                )}

                {/* Notes Tab */}
                {activeTab === 'notes' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Job Notes
                    </label>
                    {isEditing ? (
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={12}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        placeholder="Site access codes, special instructions, material notes, etc."
                      />
                    ) : (
                      <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                        {job.notes || 'No notes'}
                      </p>
                    )}
                  </div>
                )}
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
                          clientEmail: job.clientEmail,
                          clientPhone: job.clientPhone,
                          siteAddress: job.siteAddress,
                          description: job.description,
                          status: job.status,
                          assigneeId: job.assigneeId,
                          startDate: job.startDate,
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
