'use client'

import { useState } from 'react'
import { useTimeEntryStore, TimeEntry } from '@/store/timeEntryStore'
import { useTeamStore } from '@/store/teamStore'

interface TimeLogProps {
  jobId: string
}

export default function TimeLog({ jobId }: TimeLogProps) {
  const { entries, addEntry, deleteEntry, stopEntry, getEntriesByJobId, getActiveEntry, calculateJobTotalHours, calculateJobLaborCost } = useTimeEntryStore()
  const { members, getMemberById } = useTeamStore()
  const jobEntries = getEntriesByJobId(jobId)
  
  const [showAddForm, setShowAddForm] = useState(false)
  const [formData, setFormData] = useState({
    teamMemberId: '',
    startTime: '',
    endTime: '',
    duration: '',
    notes: '',
  })

  const activeMember = members.find(m => m.id === formData.teamMemberId)
  const activeEntries = members.map(m => getActiveEntry(jobId, m.id)).filter(Boolean) as TimeEntry[]
  
  // Calculate totals
  const totalHours = calculateJobTotalHours(jobId)
  const hourlyRatesMap = new Map(members.map(m => [m.id, m.hourlyRate]))
  const totalLaborCost = calculateJobLaborCost(jobId, hourlyRatesMap)

  const handleStartTimer = (memberId: string) => {
    addEntry({
      jobId,
      teamMemberId: memberId,
      startTime: Date.now(),
      duration: 0,
    })
  }

  const handleStopTimer = (entryId: string) => {
    stopEntry(entryId, Date.now())
  }

  const handleAddManualEntry = (e: React.FormEvent) => {
    e.preventDefault()
    
    const startTime = new Date(formData.startTime).getTime()
    const endTime = new Date(formData.endTime).getTime()
    const duration = Math.round((endTime - startTime) / 60000) // minutes

    if (duration <= 0) {
      alert('End time must be after start time')
      return
    }

    addEntry({
      jobId,
      teamMemberId: formData.teamMemberId,
      startTime,
      endTime,
      duration,
      notes: formData.notes || undefined,
    })

    setShowAddForm(false)
    setFormData({
      teamMemberId: '',
      startTime: '',
      endTime: '',
      duration: '',
      notes: '',
    })
  }

  const handleDeleteEntry = (entryId: string) => {
    if (window.confirm('Delete this time entry?')) {
      deleteEntry(entryId)
    }
  }

  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDateTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Hours</p>
          <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1">
            {totalHours.toFixed(1)}h
          </p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <p className="text-sm text-green-600 dark:text-green-400 font-medium">Labor Cost</p>
          <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
            ${totalLaborCost.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Active Timers */}
      {activeEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Active Timers</h4>
          {activeEntries.map((entry) => {
            const member = getMemberById(entry.teamMemberId)
            if (!member) return null

            return (
              <div
                key={entry.id}
                className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-3 h-3 rounded-full animate-pulse"
                    style={{ backgroundColor: member.color }}
                  />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Started {formatDateTime(entry.startTime)}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleStopTimer(entry.id)}
                  className="px-3 py-1.5 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Stop
                </button>
              </div>
            )
          })}
        </div>
      )}

      {/* Quick Start Timer */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Start Timer</h4>
        <div className="flex flex-wrap gap-2">
          {members.filter(m => m.active && !getActiveEntry(jobId, m.id)).map((member) => (
            <button
              key={member.id}
              onClick={() => handleStartTimer(member.id)}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-sm"
            >
              <div
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: member.color }}
              />
              {member.name}
            </button>
          ))}
        </div>
      </div>

      {/* Add Manual Entry Button */}
      <button
        onClick={() => setShowAddForm(!showAddForm)}
        className="w-full px-4 py-2 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors text-sm font-medium"
      >
        + Add Manual Entry
      </button>

      {/* Manual Entry Form */}
      {showAddForm && (
        <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-3">
          <form onSubmit={handleAddManualEntry} className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Team Member *
              </label>
              <select
                value={formData.teamMemberId}
                onChange={(e) => setFormData({ ...formData, teamMemberId: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                required
              >
                <option value="">Select team member</option>
                {members.filter(m => m.active).map((member) => (
                  <option key={member.id} value={member.id}>
                    {member.name} - ${member.hourlyRate}/hr
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.startTime}
                  onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time *
                </label>
                <input
                  type="datetime-local"
                  value={formData.endTime}
                  onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Notes
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Optional notes..."
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
              />
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Add Entry
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Time Entries List */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Time Entries ({jobEntries.length})
        </h4>
        {jobEntries.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
            No time logged yet. Start a timer or add a manual entry.
          </p>
        ) : (
          <div className="space-y-2">
            {jobEntries
              .sort((a, b) => b.startTime - a.startTime)
              .map((entry) => {
                const member = getMemberById(entry.teamMemberId)
                if (!member) return null

                return (
                  <div
                    key={entry.id}
                    className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div
                          className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                          style={{ backgroundColor: member.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {member.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {formatDateTime(entry.startTime)}
                            {entry.endTime && ` - ${formatDateTime(entry.endTime)}`}
                          </p>
                          {entry.notes && (
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {entry.notes}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 ml-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-gray-900 dark:text-white">
                            {formatDuration(entry.duration)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            ${((entry.duration / 60) * member.hourlyRate).toFixed(2)}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteEntry(entry.id)}
                          className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  )
}
