import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { JobStatus } from './jobStore'

export interface BoardColumn {
  id: string
  label: string
  status: JobStatus | string // Allow custom status values
  order: number
  color?: string
}

interface BoardSettingsState {
  columns: BoardColumn[]
  addColumn: (label: string, status?: string) => void
  updateColumn: (id: string, updates: Partial<BoardColumn>) => void
  deleteColumn: (id: string) => void
  reorderColumns: (columns: BoardColumn[]) => void
}

const defaultColumns: BoardColumn[] = [
  { id: nanoid(), label: 'Draft', status: 'Draft', order: 0 },
  { id: nanoid(), label: 'Quoted', status: 'Quoted', order: 1 },
  { id: nanoid(), label: 'Scheduled', status: 'Scheduled', order: 2 },
  { id: nanoid(), label: 'In Progress', status: 'In Progress', order: 3 },
  { id: nanoid(), label: 'Completed', status: 'Completed', order: 4 },
]

export const useBoardSettingsStore = create<BoardSettingsState>()(
  persist(
    (set) => ({
      columns: defaultColumns,

      addColumn: (label, status) => {
        set((state) => {
          const newColumn: BoardColumn = {
            id: nanoid(),
            label,
            status: status || label,
            order: state.columns.length,
          }
          return { columns: [...state.columns, newColumn] }
        })
      },

      updateColumn: (id, updates) => {
        set((state) => ({
          columns: state.columns.map((col) =>
            col.id === id ? { ...col, ...updates } : col
          ),
        }))
      },

      deleteColumn: (id) => {
        set((state) => ({
          columns: state.columns
            .filter((col) => col.id !== id)
            .map((col, index) => ({ ...col, order: index })),
        }))
      },

      reorderColumns: (columns) => {
        set({ columns: columns.map((col, index) => ({ ...col, order: index })) })
      },
    }),
    {
      name: 'fieldkit-board-settings',
    }
  )
)
