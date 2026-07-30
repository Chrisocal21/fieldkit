'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useNoteStore } from '@/store/noteStore'
import EmptyState from '@/components/shared/EmptyState'

type FolderFilter = 'all' | 'unfiled' | string

function FolderIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  )
}

function DocIcon({ className = 'w-10 h-10' }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function snippet(body: string) {
  const firstLine = body.split('\n').find((l) => l.trim().length > 0) ?? ''
  return firstLine.slice(0, 120)
}

function formatDate(ts: number) {
  const d = new Date(ts)
  const now = new Date()
  const sameYear = d.getFullYear() === now.getFullYear()
  return d.toLocaleDateString(undefined, sameYear ? { month: 'short', day: 'numeric' } : { month: 'short', day: 'numeric', year: 'numeric' })
}

export default function NotesPage() {
  const router = useRouter()
  const {
    folders, notes,
    addFolder, renameFolder, deleteFolder,
    addNote, updateNote, deleteNote,
    getNoteById, searchNotes,
  } = useNoteStore()

  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const [activeFolder, setActiveFolder] = useState<FolderFilter>('all')
  const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [showNewFolder, setShowNewFolder] = useState(false)
  const [newFolderName, setNewFolderName] = useState('')
  const [renamingFolderId, setRenamingFolderId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')
  const [deleteFolderConfirmId, setDeleteFolderConfirmId] = useState<string | null>(null)
  const [deleteNoteConfirmId, setDeleteNoteConfirmId] = useState<string | null>(null)

  const [editTitle, setEditTitle] = useState('')
  const [editBody, setEditBody] = useState('')

  // Load the selected note's content into the editor when selection changes
  useEffect(() => {
    if (!selectedNoteId) return
    const note = getNoteById(selectedNoteId)
    setEditTitle(note?.title ?? '')
    setEditBody(note?.body ?? '')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedNoteId])

  // Debounced autosave — avoids pushing to the cloud on every keystroke
  useEffect(() => {
    if (!selectedNoteId) return
    const timer = setTimeout(() => {
      updateNote(selectedNoteId, { title: editTitle, body: editBody })
    }, 600)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTitle, editBody])

  const notesByFolder = useMemo(() => {
    const counts: Record<string, number> = { all: notes.length, unfiled: 0 }
    for (const n of notes) {
      if (n.folderId === null) counts.unfiled++
      else counts[n.folderId] = (counts[n.folderId] ?? 0) + 1
    }
    return counts
  }, [notes])

  const visibleNotes = useMemo(() => {
    const q = searchQuery.trim()
    let list = q ? searchNotes(q) : notes
    if (!q) {
      if (activeFolder === 'unfiled') list = list.filter((n) => n.folderId === null)
      else if (activeFolder !== 'all') list = list.filter((n) => n.folderId === activeFolder)
    }
    return [...list].sort((a, b) => b.updatedAt - a.updatedAt)
  }, [notes, activeFolder, searchQuery, searchNotes])

  const selectedNote = selectedNoteId ? getNoteById(selectedNoteId) : undefined

  const handleNewNote = () => {
    const folderId = activeFolder === 'all' || activeFolder === 'unfiled' ? null : activeFolder
    const id = addNote(folderId)
    setSelectedNoteId(id)
  }

  const handleCreateFolder = (e: React.FormEvent) => {
    e.preventDefault()
    const name = newFolderName.trim()
    if (!name) return
    addFolder(name)
    setNewFolderName('')
    setShowNewFolder(false)
  }

  const handleRenameFolder = (e: React.FormEvent) => {
    e.preventDefault()
    if (!renamingFolderId) return
    const name = renameValue.trim()
    if (name) renameFolder(renamingFolderId, name)
    setRenamingFolderId(null)
  }

  const handleDeleteFolder = (id: string) => {
    deleteFolder(id)
    if (activeFolder === id) setActiveFolder('all')
    setDeleteFolderConfirmId(null)
  }

  const handleDeleteNote = (id: string) => {
    deleteNote(id)
    if (selectedNoteId === id) setSelectedNoteId(null)
    setDeleteNoteConfirmId(null)
  }

  if (!mounted) return null

  const folderList: { id: FolderFilter; label: string; count: number }[] = [
    { id: 'all', label: 'All Notes', count: notesByFolder.all ?? 0 },
    { id: 'unfiled', label: 'Unfiled', count: notesByFolder.unfiled ?? 0 },
    ...folders
      .slice()
      .sort((a, b) => a.name.localeCompare(b.name))
      .map((f) => ({ id: f.id as FolderFilter, label: f.name, count: notesByFolder[f.id] ?? 0 })),
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white">Notepad</h1>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            Folders and notes, synced across your devices
          </p>
        </div>
        <button
          onClick={() => router.back()}
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          Close
        </button>
      </div>

      <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white dark:bg-gray-900 h-[75vh]">
        {/* ── Folders pane (desktop only) ── */}
        <div className="hidden lg:flex lg:flex-col w-52 flex-shrink-0 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-950/40">
          <FolderList
            folderList={folderList}
            activeFolder={activeFolder}
            setActiveFolder={setActiveFolder}
            renamingFolderId={renamingFolderId}
            renameValue={renameValue}
            setRenameValue={setRenameValue}
            handleRenameFolder={handleRenameFolder}
            setRenamingFolderId={setRenamingFolderId}
            deleteFolderConfirmId={deleteFolderConfirmId}
            setDeleteFolderConfirmId={setDeleteFolderConfirmId}
            handleDeleteFolder={handleDeleteFolder}
            showNewFolder={showNewFolder}
            setShowNewFolder={setShowNewFolder}
            newFolderName={newFolderName}
            setNewFolderName={setNewFolderName}
            handleCreateFolder={handleCreateFolder}
          />
        </div>

        {/* ── Notes list pane ── */}
        <div className={`${selectedNoteId ? 'hidden lg:flex' : 'flex'} lg:flex flex-col w-full lg:w-72 flex-shrink-0 border-r border-gray-200 dark:border-gray-700`}>
          {/* Mobile-only folder chips */}
          <div className="lg:hidden flex gap-2 overflow-x-auto px-3 py-2 border-b border-gray-200 dark:border-gray-700">
            {folderList.map((f) => (
              <button
                key={f.id}
                onClick={() => setActiveFolder(f.id)}
                className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap ${
                  activeFolder === f.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                }`}
              >
                {f.label} {f.count > 0 && <span className="opacity-70">({f.count})</span>}
              </button>
            ))}
          </div>

          <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Search notes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-1.5 pl-8 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
              />
              <svg className="absolute left-2.5 top-2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={handleNewNote}
              title="New note"
              className="flex-shrink-0 p-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {visibleNotes.length === 0 ? (
              <div className="p-6 text-center text-sm text-gray-400 dark:text-gray-600">
                No notes here yet
              </div>
            ) : (
              visibleNotes.map((note) => (
                <button
                  key={note.id}
                  onClick={() => setSelectedNoteId(note.id)}
                  className={`w-full text-left px-4 py-3 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/60 ${
                    selectedNoteId === note.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {note.title.trim() || 'Untitled'}
                    </span>
                    <span className="flex-shrink-0 text-xs text-gray-400 dark:text-gray-500">
                      {formatDate(note.updatedAt)}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400 truncate">
                    {snippet(note.body) || 'No additional text'}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>

        {/* ── Editor pane ── */}
        <div className={`${selectedNoteId ? 'flex' : 'hidden lg:flex'} flex-1 flex-col min-w-0`}>
          {!selectedNote ? (
            <EmptyState
              title="No note selected"
              description="Pick a note from the list, or create a new one to get started."
              icon={<DocIcon />}
              action={{ label: 'New Note', onClick: handleNewNote }}
            />
          ) : (
            <>
              <div className="flex items-center justify-between gap-2 px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setSelectedNoteId(null)}
                  className="lg:hidden flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Notes
                </button>
                <span className="hidden lg:block text-xs text-gray-400 dark:text-gray-500">
                  Edited {formatDate(selectedNote.updatedAt)}
                </span>
                {deleteNoteConfirmId === selectedNote.id ? (
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-gray-500 dark:text-gray-400">Delete this note?</span>
                    <button onClick={() => handleDeleteNote(selectedNote.id)} className="text-red-600 font-medium">Delete</button>
                    <button onClick={() => setDeleteNoteConfirmId(null)} className="text-gray-500">Cancel</button>
                  </div>
                ) : (
                  <button
                    onClick={() => setDeleteNoteConfirmId(selectedNote.id)}
                    className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                    title="Delete note"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                )}
              </div>

              <div className="px-4 py-2 border-b border-gray-100 dark:border-gray-800">
                <select
                  value={selectedNote.folderId ?? ''}
                  onChange={(e) => updateNote(selectedNote.id, { folderId: e.target.value || null })}
                  className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                >
                  <option value="">Unfiled</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>{f.name}</option>
                  ))}
                </select>
              </div>

              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                placeholder="Title"
                className="px-4 py-3 text-lg font-semibold bg-transparent text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:outline-none"
              />
              <textarea
                value={editBody}
                onChange={(e) => setEditBody(e.target.value)}
                placeholder="Start writing..."
                className="flex-1 px-4 pb-4 bg-transparent text-sm text-gray-700 dark:text-gray-300 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none focus:outline-none"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

function FolderList({
  folderList, activeFolder, setActiveFolder,
  renamingFolderId, renameValue, setRenameValue, handleRenameFolder, setRenamingFolderId,
  deleteFolderConfirmId, setDeleteFolderConfirmId, handleDeleteFolder,
  showNewFolder, setShowNewFolder, newFolderName, setNewFolderName, handleCreateFolder,
}: {
  folderList: { id: FolderFilter; label: string; count: number }[]
  activeFolder: FolderFilter
  setActiveFolder: (f: FolderFilter) => void
  renamingFolderId: string | null
  renameValue: string
  setRenameValue: (v: string) => void
  handleRenameFolder: (e: React.FormEvent) => void
  setRenamingFolderId: (id: string | null) => void
  deleteFolderConfirmId: string | null
  setDeleteFolderConfirmId: (id: string | null) => void
  handleDeleteFolder: (id: string) => void
  showNewFolder: boolean
  setShowNewFolder: (v: boolean) => void
  newFolderName: string
  setNewFolderName: (v: string) => void
  handleCreateFolder: (e: React.FormEvent) => void
}) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto py-2">
        {folderList.map((f) => {
          const isCustomFolder = f.id !== 'all' && f.id !== 'unfiled'
          const isRenaming = isCustomFolder && renamingFolderId === f.id
          const isConfirmingDelete = isCustomFolder && deleteFolderConfirmId === f.id

          if (isRenaming) {
            return (
              <form key={f.id} onSubmit={handleRenameFolder} className="px-3 py-1">
                <input
                  autoFocus
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onBlur={handleRenameFolder}
                  className="w-full px-2 py-1 text-sm border border-blue-400 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                />
              </form>
            )
          }

          return (
            <div
              key={f.id}
              className={`group flex items-center justify-between px-3 py-2 mx-1 rounded-md cursor-pointer ${
                activeFolder === f.id
                  ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
              onClick={() => setActiveFolder(f.id)}
            >
              <span className="flex items-center gap-2 min-w-0">
                <FolderIcon className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm truncate">{f.label}</span>
              </span>

              {isConfirmingDelete ? (
                <span className="flex-shrink-0 flex items-center gap-1.5 text-[11px]">
                  <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(f.id) }} className="text-red-600 font-medium">Delete</button>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteFolderConfirmId(null) }} className="text-gray-500">Cancel</button>
                </span>
              ) : (
                <span className="flex-shrink-0 flex items-center gap-1">
                  <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:hidden">{f.count}</span>
                  {isCustomFolder && (
                    <span className="hidden group-hover:flex items-center gap-1">
                      <button
                        onClick={(e) => { e.stopPropagation(); setRenamingFolderId(f.id); setRenameValue(f.label) }}
                        className="p-0.5 text-gray-400 hover:text-blue-600"
                        title="Rename"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeleteFolderConfirmId(f.id) }}
                        className="p-0.5 text-gray-400 hover:text-red-600"
                        title="Delete"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </span>
                  )}
                </span>
              )}
            </div>
          )
        })}
      </div>

      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
        {showNewFolder ? (
          <form onSubmit={handleCreateFolder} className="flex gap-1">
            <input
              autoFocus
              value={newFolderName}
              onChange={(e) => setNewFolderName(e.target.value)}
              onBlur={() => { if (!newFolderName.trim()) setShowNewFolder(false) }}
              placeholder="Folder name"
              className="w-full px-2 py-1.5 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </form>
        ) : (
          <button
            onClick={() => setShowNewFolder(true)}
            className="w-full flex items-center gap-2 px-2 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Folder
          </button>
        )}
      </div>
    </div>
  )
}
