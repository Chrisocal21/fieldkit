'use client'

import { useState, useEffect } from 'react'
import { nanoid } from 'nanoid'
import { Client, ClientProperty, useClientStore } from '@/store/clientStore'
import { useJobStore } from '@/store/jobStore'
import EmptyState from '@/components/shared/EmptyState'
import ClientDrawer from '@/components/clients/ClientDrawer'

export default function ClientsPage() {
  const { clients, searchClients, addClient, updateClient, deleteClient, migrateFromJobs } = useClientStore()
  const { getJobsByClientId } = useJobStore()

  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedClient, setSelectedClient] = useState<Client | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // Prevent hydration mismatch and trigger migration
  useEffect(() => {
    setMounted(true)
    // Trigger migration if no clients exist
    if (clients.length === 0) {
      migrateFromJobs()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const displayClients = mounted
    ? searchQuery
      ? searchClients(searchQuery)
      : clients
    : []

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    notes: '',
    properties: [] as ClientProperty[],
  })

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    addClient({
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      notes: formData.notes || undefined,
      properties: formData.properties,
      tags: [],
    })

    setFormData({ name: '', email: '', phone: '', address: '', notes: '', properties: [] })
    setIsCreateModalOpen(false)
  }

  const handleUpdateClient = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedClient || !formData.name.trim()) return

    updateClient(selectedClient.id, {
      name: formData.name,
      email: formData.email || undefined,
      phone: formData.phone || undefined,
      address: formData.address || undefined,
      notes: formData.notes || undefined,
      properties: formData.properties,
    })

    setIsEditMode(false)
    setSelectedClient(null)
  }

  const handleEditClick = (client: Client, e?: React.MouseEvent) => {
    e?.stopPropagation() // Prevent opening drawer when clicking edit
    setIsDrawerOpen(false) // Close drawer if open
    setSelectedClient(client)
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
      notes: client.notes || '',
      properties: client.properties || [],
    })
    setIsEditMode(true)
  }

  const handleDeleteClient = (clientId: string, e?: React.MouseEvent) => {
    e?.stopPropagation() // Prevent opening drawer when clicking delete
    if (deleteConfirmId === clientId) {
      deleteClient(clientId)
      setDeleteConfirmId(null)
      if (selectedClient?.id === clientId) {
        setSelectedClient(null)
        setIsDrawerOpen(false)
      }
    } else {
      setDeleteConfirmId(clientId)
      setTimeout(() => setDeleteConfirmId(null), 3000)
    }
  }

  const handleClientClick = (client: Client) => {
    setSelectedClient(client)
    setIsDrawerOpen(true)
  }

  const handleDrawerEdit = (client: Client) => {
    setIsDrawerOpen(false)
    handleEditClick(client)
  }

  const handleCreateJobForClient = () => {
    // TODO: Open job creation modal with client pre-selected
    setIsDrawerOpen(false)
    // This can be enhanced later to pre-select the client in CreateJobModal
  }

  const addProperty = () => {
    setFormData(prev => ({
      ...prev,
      properties: [...prev.properties, { id: nanoid(), label: '', address: '' }],
    }))
  }

  const updateProperty = (id: string, field: 'label' | 'address', value: string) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.map(p => p.id === id ? { ...p, [field]: value } : p),
    }))
  }

  const removeProperty = (id: string) => {
    setFormData(prev => ({
      ...prev,
      properties: prev.properties.filter(p => p.id !== id),
    }))
  }

  if (!mounted) {
    return null
  }

  if (clients.length === 0 && !searchQuery) {
    return (
      <>
        <EmptyState
          title="No clients yet"
          description="Add your first client to start tracking jobs and quotes for them."
          action={{
            label: 'Add Client',
            onClick: () => setIsCreateModalOpen(true),
          }}
        />

        {/* Create Modal */}
        {isCreateModalOpen && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Add Client</h2>
              <form onSubmit={handleCreateClient} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Client
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false)
                      setFormData({ name: '', email: '', phone: '', address: '', notes: '', properties: [] })
                    }}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Clients</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Manage your clients and their job history
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Client
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
        />
        <svg
          className="absolute left-3 top-2.5 w-5 h-5 text-gray-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
      </div>

      {/* Clients Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {displayClients.map((client) => {
          const jobCount = getJobsByClientId(client.id).length
          return (
            <div
              key={client.id}
              onClick={() => handleClientClick(client)}
              className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 hover:shadow-md transition-shadow cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">{client.name}</h3>
                <div className="flex gap-1">
                  <button
                    onClick={(e) => handleEditClick(client, e)}
                    className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={(e) => handleDeleteClient(client.id, e)}
                    className={`text-xs px-2 py-1 rounded transition-colors ${
                      deleteConfirmId === client.id
                        ? 'bg-red-500 text-white hover:bg-red-600'
                        : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                    }`}
                  >
                    {deleteConfirmId === client.id ? 'Confirm?' : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400 mb-3">
                {client.email && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    {client.email}
                  </div>
                )}
                {client.phone && (
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    {client.phone}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {jobCount} {jobCount === 1 ? 'job' : 'jobs'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {displayClients.length === 0 && searchQuery && (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">No clients found matching &quot;{searchQuery}&quot;</p>
        </div>
      )}

      {/* Create/Edit Modal */}
      {(isCreateModalOpen || isEditMode) && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {isEditMode ? 'Edit Client' : 'Add Client'}
            </h2>
            <form onSubmit={isEditMode ? handleUpdateClient : handleCreateClient} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              {/* Properties / Job Sites */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Properties / Job Sites
                  </label>
                  <button
                    type="button"
                    onClick={addProperty}
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    + Add property
                  </button>
                </div>
                {formData.properties.length > 0 ? (
                  <div className="space-y-2">
                    {formData.properties.map((prop) => (
                      <div key={prop.id} className="flex gap-2 items-center">
                        <input
                          type="text"
                          value={prop.label}
                          onChange={(e) => updateProperty(prop.id, 'label', e.target.value)}
                          placeholder="Label (e.g. Home)"
                          className="w-28 flex-shrink-0 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                        <input
                          type="text"
                          value={prop.address}
                          onChange={(e) => updateProperty(prop.id, 'address', e.target.value)}
                          placeholder="Address"
                          className="flex-1 px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => removeProperty(prop.id)}
                          className="p-1 text-gray-400 hover:text-red-500"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-gray-400 dark:text-gray-500">
                    Add multiple job-site addresses for this client
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {isEditMode ? 'Update' : 'Add'} Client
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsCreateModalOpen(false)
                    setIsEditMode(false)
                    setSelectedClient(null)
                    setFormData({ name: '', email: '', phone: '', address: '', notes: '', properties: [] })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Client Drawer */}
      <ClientDrawer
        client={selectedClient}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedClient(null)
        }}
        onEdit={handleDrawerEdit}
        onCreateJob={handleCreateJobForClient}
      />
    </div>
  )
}
