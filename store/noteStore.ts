import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { userScopedStorage } from '@/lib/userStorage'
import api from '@/lib/api'

export interface NoteFolder {
  id: string
  name: string
  createdAt: number
  updatedAt: number
}

export interface Note {
  id: string
  folderId: string | null
  title: string
  body: string
  createdAt: number
  updatedAt: number
}

interface NoteState {
  folders: NoteFolder[]
  notes: Note[]
  addFolder: (name: string) => string
  renameFolder: (id: string, name: string) => void
  deleteFolder: (id: string) => void
  addNote: (folderId: string | null) => string
  updateNote: (id: string, updates: Partial<Pick<Note, 'title' | 'body' | 'folderId'>>) => void
  deleteNote: (id: string) => void
  getNoteById: (id: string) => Note | undefined
  getNotesByFolder: (folderId: string | null) => Note[]
  searchNotes: (query: string) => Note[]
}

export const useNoteStore = create<NoteState>()(
  persist(
    (set, get) => ({
      folders: [],
      notes: [],

      addFolder: (name) => {
        const newFolder: NoteFolder = {
          id: nanoid(),
          name,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({ folders: [...state.folders, newFolder] }))
        api.noteFolders.create(newFolder)
        return newFolder.id
      },

      renameFolder: (id, name) => {
        set((state) => ({
          folders: state.folders.map((f) =>
            f.id === id ? { ...f, name, updatedAt: Date.now() } : f
          ),
        }))
        api.noteFolders.update(id, { name, updatedAt: Date.now() })
      },

      deleteFolder: (id) => {
        const affectedNotes = get().notes.filter((n) => n.folderId === id)
        set((state) => ({
          folders: state.folders.filter((f) => f.id !== id),
          notes: state.notes.map((n) =>
            n.folderId === id ? { ...n, folderId: null, updatedAt: Date.now() } : n
          ),
        }))
        api.noteFolders.delete(id)
        // Keep the cloud copy of each unfiled note in sync with the folder removal
        affectedNotes.forEach((n) => api.notes.update(n.id, { ...n, folderId: null, updatedAt: Date.now() }))
      },

      addNote: (folderId) => {
        const newNote: Note = {
          id: nanoid(),
          folderId,
          title: '',
          body: '',
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({ notes: [newNote, ...state.notes] }))
        api.notes.create(newNote)
        return newNote.id
      },

      updateNote: (id, updates) => {
        const existing = get().notes.find((n) => n.id === id)
        set((state) => ({
          notes: state.notes.map((n) =>
            n.id === id ? { ...n, ...updates, updatedAt: Date.now() } : n
          ),
        }))
        api.notes.update(id, { ...existing, ...updates, updatedAt: Date.now() })
      },

      deleteNote: (id) => {
        set((state) => ({ notes: state.notes.filter((n) => n.id !== id) }))
        api.notes.delete(id)
      },

      getNoteById: (id) => get().notes.find((n) => n.id === id),

      getNotesByFolder: (folderId) =>
        get()
          .notes.filter((n) => n.folderId === folderId)
          .sort((a, b) => b.updatedAt - a.updatedAt),

      searchNotes: (query) => {
        const q = query.trim().toLowerCase()
        if (!q) return get().notes
        return get().notes.filter(
          (n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q)
        )
      },
    }),
    {
      name: 'fieldkit-notes',
      storage: userScopedStorage,
      version: 1,
      migrate: (state: any) => state,
    }
  )
)
