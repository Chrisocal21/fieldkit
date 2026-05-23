import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { userScopedStorage } from '@/lib/userStorage'
import api from '@/lib/api'

export interface JobMaterial {
  id: string
  jobId: string
  inventoryItemId?: string  // Link to inventory item if applicable
  description: string       // Material name/description
  quantity: number
  unitCost: number
  totalCost: number
  usedAt: number           // Timestamp when material was recorded
  notes?: string
}

interface MaterialCostState {
  jobMaterials: JobMaterial[]
  
  // CRUD operations
  addJobMaterial: (materialData: Omit<JobMaterial, 'id' | 'totalCost' | 'usedAt'>) => void
  updateJobMaterial: (id: string, updates: Partial<JobMaterial>) => void
  deleteJobMaterial: (id: string) => void
  getJobMaterialById: (id: string) => JobMaterial | undefined
  getJobMaterialsByJobId: (jobId: string) => JobMaterial[]
  
  // Calculations
  calculateJobMaterialCost: (jobId: string) => number
  getTotalMaterialCosts: () => number
  
  // Inventory integration (future)
  linkToInventoryItem: (materialId: string, inventoryItemId: string) => void
}

export const useMaterialCostStore = create<MaterialCostState>()(
  persist(
    (set, get) => ({
      jobMaterials: [],

      addJobMaterial: (materialData) => {
        const totalCost = materialData.quantity * materialData.unitCost
        const material: JobMaterial = {
          ...materialData,
          id: `MAT-${nanoid(6).toUpperCase()}`,
          totalCost,
          usedAt: Date.now()
        }
        set((state) => ({
          jobMaterials: [...state.jobMaterials, material]
        }))
        // Auto-deduct from personal inventory when linked
        if (materialData.inventoryItemId) {
          const { useInventoryStore } = require('./inventoryStore')
          useInventoryStore.getState().adjustStock(
            materialData.inventoryItemId,
            -materialData.quantity,
            `Used on job`
          )
        }
        api.materials.create(material)
      },

      updateJobMaterial: (id, updates) => {
        set((state) => ({
          jobMaterials: state.jobMaterials.map((material) => {
            if (material.id === id) {
              const updatedMaterial = { ...material, ...updates }
              if (updates.quantity !== undefined || updates.unitCost !== undefined) {
                updatedMaterial.totalCost = updatedMaterial.quantity * updatedMaterial.unitCost
              }
              return updatedMaterial
            }
            return material
          })
        }))
        api.materials.update(id, updates)
      },

      deleteJobMaterial: (id) => {
        const material = get().jobMaterials.find(m => m.id === id)
        // Restore inventory stock when deleting a linked material
        if (material?.inventoryItemId) {
          const { useInventoryStore } = require('./inventoryStore')
          useInventoryStore.getState().adjustStock(
            material.inventoryItemId,
            material.quantity,
            `Material removed from job`
          )
        }
        set((state) => ({
          jobMaterials: state.jobMaterials.filter((material) => material.id !== id)
        }))
        api.materials.delete(id)
      },

      getJobMaterialById: (id) => {
        return get().jobMaterials.find((material) => material.id === id)
      },

      getJobMaterialsByJobId: (jobId) => {
        return get().jobMaterials
          .filter((material) => material.jobId === jobId)
          .sort((a, b) => b.usedAt - a.usedAt) // Most recent first
      },

      calculateJobMaterialCost: (jobId) => {
        return get().jobMaterials
          .filter((material) => material.jobId === jobId)
          .reduce((sum, material) => sum + material.totalCost, 0)
      },

      getTotalMaterialCosts: () => {
        return get().jobMaterials
          .reduce((sum, material) => sum + material.totalCost, 0)
      },

      linkToInventoryItem: (materialId, inventoryItemId) => {
        set((state) => ({
          jobMaterials: state.jobMaterials.map((material) =>
            material.id === materialId
              ? { ...material, inventoryItemId }
              : material
          )
        }))
      }
    }),
    {
      name: 'fieldkit-material-costs',
      storage: userScopedStorage,
      version: 1
    }
  )
)
