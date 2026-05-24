'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useJobStore } from '@/store/jobStore'
import { useClientStore } from '@/store/clientStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { useTeamStore } from '@/store/teamStore'
import { useQuoteStore } from '@/store/quoteStore'

type SearchResultType = 'job' | 'client' | 'inventory' | 'team' | 'quote'

interface SearchResult {
  id: string
  type: SearchResultType
  title: string
  subtitle?: string
  metadata?: string
  onClick: () => void
}

const RECENT_SEARCHES_KEY = 'fieldkit_recent_searches'
const MAX_RECENT_SEARCHES = 5

export default function GlobalSearch() {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState<SearchResultType | 'all'>('all')
  const [recentSearches, setRecentSearches] = useState<string[]>([])

  const jobs = useJobStore((state) => state.jobs)
  const clients = useClientStore((state) => state.clients)
  const inventory = useInventoryStore((state) => state.items)
  const members = useTeamStore((state) => state.members)
  const getAllQuotes = useQuoteStore((state) => state.getAllQuotes)
  const quotes = useMemo(() => getAllQuotes(), [jobs]) // re-derive when jobs change

  // Load recent searches on mount
  useEffect(() => {
    const saved = localStorage.getItem(RECENT_SEARCHES_KEY)
    if (saved) {
      setRecentSearches(JSON.parse(saved))
    }
  }, [])

  // Save to recent searches
  const saveToRecent = useCallback((searchQuery: string) => {
    if (!searchQuery.trim()) return
    
    const updated = [
      searchQuery,
      ...recentSearches.filter(s => s !== searchQuery)
    ].slice(0, MAX_RECENT_SEARCHES)
    
    setRecentSearches(updated)
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated))
  }, [recentSearches])

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K or Ctrl+K
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(prev => !prev)
      }
      // Escape to close
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
        setQuery('')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Simple fuzzy match function
  const fuzzyMatch = (str: string, pattern: string): boolean => {
    const lowerStr = str.toLowerCase()
    const lowerPattern = pattern.toLowerCase()
    
    // Exact substring match
    if (lowerStr.includes(lowerPattern)) return true
    
    // Fuzzy match - all characters in pattern must appear in order
    let patternIdx = 0
    for (let i = 0; i < lowerStr.length && patternIdx < lowerPattern.length; i++) {
      if (lowerStr[i] === lowerPattern[patternIdx]) {
        patternIdx++
      }
    }
    return patternIdx === lowerPattern.length
  }

  // Search results
  const searchResults = useMemo(() => {
    if (!query.trim()) return []

    const results: SearchResult[] = []

    // Search jobs
    if (activeFilter === 'all' || activeFilter === 'job') {
      jobs.forEach(job => {
        const client = clients.find(c => c.id === job.clientId)
        const searchStr = `${job.title} ${job.description || ''} ${client?.name || ''}`
        
        if (fuzzyMatch(searchStr, query)) {
          results.push({
            id: job.id,
            type: 'job',
            title: job.title,
            subtitle: client?.name,
            metadata: job.status,
            onClick: () => {
              saveToRecent(query)
              setIsOpen(false)
              setQuery('')
              router.push(`/jobs?id=${job.id}`)
            }
          })
        }
      })
    }

    // Search clients
    if (activeFilter === 'all' || activeFilter === 'client') {
      clients.forEach(client => {
        const searchStr = `${client.name} ${client.email || ''} ${client.phone || ''} ${client.address || ''}`
        
        if (fuzzyMatch(searchStr, query)) {
          results.push({
            id: client.id,
            type: 'client',
            title: client.name,
            subtitle: client.email || client.phone,
            metadata: client.address,
            onClick: () => {
              saveToRecent(query)
              setIsOpen(false)
              setQuery('')
              // Navigate to clients page - you'll need to implement client detail view
              router.push('/clients')
            }
          })
        }
      })
    }

    // Search inventory
    if (activeFilter === 'all' || activeFilter === 'inventory') {
      inventory.forEach(item => {
        const searchStr = `${item.name} ${item.notes || ''} ${item.category}`
        
        if (fuzzyMatch(searchStr, query)) {
          results.push({
            id: item.id,
            type: 'inventory',
            title: item.name,
            subtitle: `${item.category} - ${item.currentStock} ${item.unit}`,
            metadata: undefined,
            onClick: () => {
              saveToRecent(query)
              setIsOpen(false)
              setQuery('')
              router.push('/inventory')
            }
          })
        }
      })
    }

    // Search team members
    if (activeFilter === 'all' || activeFilter === 'team') {
      members.forEach(member => {
        const searchStr = `${member.name} ${member.email || ''} ${member.phone || ''} ${member.role}`
        
        if (fuzzyMatch(searchStr, query)) {
          results.push({
            id: member.id,
            type: 'team',
            title: member.name,
            subtitle: member.role,
            metadata: member.email,
            onClick: () => {
              saveToRecent(query)
              setIsOpen(false)
              setQuery('')
              // Navigate to team management (Settings modal)
              router.push('/team')
            }
          })
        }
      })
    }

    // Search quotes
    if (activeFilter === 'all' || activeFilter === 'quote') {
      quotes.forEach(quote => {
        const job = jobs.find(j => j.id === quote.jobId)
        const searchStr = `${quote.clientName} ${quote.notes || ''} ${job?.title || ''}`
        
        if (fuzzyMatch(searchStr, query)) {
          results.push({
            id: quote.id,
            type: 'quote',
            title: `Quote #${quote.quoteNumber}`,
            subtitle: quote.clientName,
            metadata: quote.status,
            onClick: () => {
              saveToRecent(query)
              setIsOpen(false)
              setQuery('')
              router.push('/quotes')
            }
          })
        }
      })
    }

    return results
  }, [query, activeFilter, jobs, clients, inventory, members, quotes, router, saveToRecent])

  // Group results by type
  const groupedResults = useMemo(() => {
    const groups: Record<SearchResultType, SearchResult[]> = {
      job: [],
      client: [],
      inventory: [],
      team: [],
      quote: []
    }

    searchResults.forEach(result => {
      groups[result.type].push(result)
    })

    return groups
  }, [searchResults])

  // Type icons and labels
  const typeConfig = {
    job: { icon: '💼', label: 'Jobs', color: 'text-blue-600 dark:text-blue-400' },
    client: { icon: '👤', label: 'Clients', color: 'text-green-600 dark:text-green-400' },
    inventory: { icon: '📦', label: 'Inventory', color: 'text-purple-600 dark:text-purple-400' },
    team: { icon: '👥', label: 'Team', color: 'text-orange-600 dark:text-orange-400' },
    quote: { icon: '📄', label: 'Quotes', color: 'text-indigo-600 dark:text-indigo-400' }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 transition-opacity"
        onClick={() => {
          setIsOpen(false)
          setQuery('')
        }}
      />

      {/* Search Modal */}
      <div className="fixed top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl z-50 px-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Search Input */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search jobs, clients, inventory, team..."
              autoFocus
              className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-sm"
            />
            <kbd className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">
              ESC
            </kbd>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                activeFilter === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {Object.entries(typeConfig).map(([type, config]) => (
              <button
                key={type}
                onClick={() => setActiveFilter(type as SearchResultType)}
                className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                  activeFilter === type
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                }`}
              >
                {config.icon} {config.label}
              </button>
            ))}
          </div>

          {/* Results */}
          <div className="max-h-96 overflow-y-auto">
            {!query.trim() && recentSearches.length > 0 && (
              <div className="p-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Recent Searches</p>
                <div className="space-y-1">
                  {recentSearches.map((search, idx) => (
                    <button
                      key={idx}
                      onClick={() => setQuery(search)}
                      className="w-full text-left px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center gap-2"
                    >
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {search}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {query.trim() && searchResults.length === 0 && (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-gray-500 dark:text-gray-400">No results found for &quot;{query}&quot;</p>
              </div>
            )}

            {query.trim() && searchResults.length > 0 && (
              <div className="py-2">
                {(Object.entries(groupedResults) as [SearchResultType, SearchResult[]][]).map(([type, results]) => {
                  if (results.length === 0) return null

                  const config = typeConfig[type]

                  return (
                    <div key={type} className="mb-4">
                      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50">
                        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                          {config.icon} {config.label}
                        </p>
                      </div>
                      <div>
                        {results.map(result => (
                          <button
                            key={result.id}
                            onClick={result.onClick}
                            className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700/50 last:border-0"
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {result.title}
                                </p>
                                {result.subtitle && (
                                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                    {result.subtitle}
                                  </p>
                                )}
                              </div>
                              {result.metadata && (
                                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                                  {result.metadata}
                                </span>
                              )}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">↑</kbd>
                <kbd className="px-1.5 py-0.5 font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">↓</kbd>
                <span>Navigate</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">↵</kbd>
                <span>Select</span>
              </div>
            </div>
            <div>
              <kbd className="px-1.5 py-0.5 font-semibold bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded">⌘K</kbd> to toggle
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
