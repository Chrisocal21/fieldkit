import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { userScopedStorage } from '@/lib/userStorage'
import api from '@/lib/api'

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

export const useInventoryStore = create<InventoryState>()(
  persist(
    (set, get) => ({
      items: [],
      adjustments: [],
      
      addItem: (itemData) => {
        const newItem: InventoryItem = {
          ...itemData,
          id: nanoid(),
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({ items: [...state.items, newItem] }))
        api.inventory.create(newItem)
      },
      
      updateItem: (id, updates) => {
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, ...updates, updatedAt: Date.now() } : item
          ),
        }))
        api.inventory.update(id, { ...updates, updatedAt: Date.now() })
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
        api.inventory.adjust(itemId, delta, reason)
      },
      
      getItemById: (id) => {
        return get().items.find((item) => item.id === id)
      },
    }),
    {
      name: 'fieldkit-inventory',
      storage: userScopedStorage,
    }
  )
)
