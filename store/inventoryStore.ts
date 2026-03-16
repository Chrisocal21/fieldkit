import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export interface InventoryItem {
  id: string
  name: string
  category: string
  unit: string
  currentStock: number
  lowStockThreshold: number
  notes: string
  createdAt: number
  updatedAt: number
}

export interface InventoryAdjustment {
  id: string
  itemId: string
  delta: number
  reason: string
  adjustedAt: number
}

interface InventoryState {
  items: InventoryItem[]
  adjustments: InventoryAdjustment[]
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateItem: (id: string, updates: Partial<InventoryItem>) => void
  adjustStock: (itemId: string, delta: number, reason: string) => void
  getItemById: (id: string) => InventoryItem | undefined
}

const mockItems: InventoryItem[] = [
  {
    id: nanoid(),
    name: 'Walnut Wood Sheets',
    category: 'Wood',
    unit: 'sheets',
    currentStock: 15,
    lowStockThreshold: 5,
    notes: '12" x 24" standard size',
    createdAt: Date.now() - 86400000 * 30,
    updatedAt: Date.now(),
  },
  {
    id: nanoid(),
    name: 'Acrylic Clear 1/4"',
    category: 'Acrylic',
    unit: 'sheets',
    currentStock: 3,
    lowStockThreshold: 5,
    notes: 'Reorder needed',
    createdAt: Date.now() - 86400000 * 20,
    updatedAt: Date.now(),
  },
  {
    id: nanoid(),
    name: 'Laser Cutting Gas',
    category: 'Consumables',
    unit: 'oz',
    currentStock: 250,
    lowStockThreshold: 100,
    notes: 'Monthly usage ~300oz',
    createdAt: Date.now() - 86400000 * 60,
    updatedAt: Date.now(),
  },
]

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: mockItems,
      adjustments: [],
      
      addItem: (itemData) => {
        const newItem: InventoryItem = {
          ...itemData,
          id: nanoid(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({ items: [...state.items, newItem] }))
      },
      
      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
          ),
        }))
      },
      
      adjustStock: (itemId, delta, reason) => {
        const adjustment: InventoryAdjustment = {
          id: nanoid(),
          itemId,
          delta,
          reason,
          adjustedAt: Date.now(),
        }
        
        set((state) => ({
          items: state.items.map((item) =>
            item.id === itemId
              ? { ...item, currentStock: item.currentStock + delta, updatedAt: Date.now() }
              : item
          ),
          adjustments: [...state.adjustments, adjustment],
        }))
      },
      
      getItemById: (id) => {
        return get().items.find((item) => item.id === id)
      },
    }),
    {
      name: 'fieldkit-inventory',
    }
  )
)
