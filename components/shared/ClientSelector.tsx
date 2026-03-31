'use client'

import { useState, useEffect, useRef } from 'react'
import { Client, useClientStore } from '@/store/clientStore'

interface ClientSelectorProps {
  selectedClientId?: string
  onSelectClient: (clientId: string) => void
  onCreateClient?: (clientData: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => void
  label?: string
}

export default function ClientSelector({
  selectedClientId,
  onSelectClient,
  onCreateClient,
  label = 'Client',
}: ClientSelectorProps) {
  const { clients, searchClients, addClient, getClientById } = useClientStore()
  
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
  })

  const selectedClient = selectedClientId ? getClientById(selectedClientId) : undefined
  const searchResults = searchQuery ? searchClients(searchQuery) : clients

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setShowCreateForm(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelectClient = (client: Client) => {
    onSelectClient(client.id)
    setIsOpen(false)
    setSearchQuery('')
  }

  const handleCreateClient = () => {
    if (!newClientData.name.trim()) return

    const clientId = addClient({
      name: newClientData.name,
      email: newClientData.email || undefined,
      phone: newClientData.phone || undefined,
      address: newClientData.address || undefined,
      tags: [],
    })

    if (onCreateClient) {
      onCreateClient(newClientData)
    }
    
    onSelectClient(clientId)
    setIsOpen(false)
    setShowCreateForm(false)
    setNewClientData({ name: '', email: '', phone: '', address: '' })
    setSearchQuery('')
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        {label}
      </label>

      {/* Selected Client Display / Search Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-left flex items-center justify-between hover:border-blue-500 dark:hover:border-blue-400 transition-colors"
      >
        <span className="text-gray-900 dark:text-white">
          {selectedClient ? selectedClient.name : 'Select or create client...'}
        </span>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200 dark:border-gray-700">
            <input
              type="text"
              placeholder="Search clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Client List */}
          {!showCreateForm && (
            <div className="overflow-y-auto flex-1">
              {searchResults.length > 0 ? (
                searchResults.map((client) => (
                  <button
                    key={client.id}
                    type="button"
                    onClick={() => handleSelectClient(client)}
                    className={`w-full px-4 py-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-b-0 ${
                      selectedClientId === client.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                    }`}
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{client.name}</div>
                    {(client.email || client.phone) && (
                      <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {client.email && <span>{client.email}</span>}
                        {client.email && client.phone && <span className="mx-2">•</span>}
                        {client.phone && <span>{client.phone}</span>}
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                  No clients found
                </div>
              )}
            </div>
          )}

          {/* Create New Client Form */}
          {showCreateForm && (
            <div className="p-4 space-y-3">
              <h3 className="font-medium text-gray-900 dark:text-white">Create New Client</h3>
              <input
                type="text"
                placeholder="Client name *"
                value={newClientData.name}
                onChange={(e) => setNewClientData({ ...newClientData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email"
                value={newClientData.email}
                onChange={(e) => setNewClientData({ ...newClientData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={newClientData.phone}
                onChange={(e) => setNewClientData({ ...newClientData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <input
                type="text"
                placeholder="Address"
                value={newClientData.address}
                onChange={(e) => setNewClientData({ ...newClientData, address: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-900 text-gray-900 dark:text-white"
              />
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCreateClient}
                  disabled={!newClientData.name.trim()}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setNewClientData({ name: '', email: '', phone: '', address: '' })
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Create New Button */}
          {!showCreateForm && (
            <button
              type="button"
              onClick={() => setShowCreateForm(true)}
              className="w-full px-4 py-3 text-left border-t border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create new client
            </button>
          )}
        </div>
      )}
    </div>
  )
}
