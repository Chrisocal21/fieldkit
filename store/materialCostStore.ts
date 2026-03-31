import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

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

// Mock data for development
const mockJobMaterials: JobMaterial[] = [
  {
    id: 'MAT-0001',
    jobId: 'JOB-0001',
    inventoryItemId: undefined,
    description: 'Walnut wood boards (3x)',
    quantity: 3,
    unitCost: 45.00,
    totalCost: 135.00,
    usedAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    notes: 'Premium walnut for wedding signs'
  },
  {
    id: 'MAT-0002',
    jobId: 'JOB-0001',
    inventoryItemId: undefined,
    description: 'Wood stain (walnut finish)',
    quantity: 1,
    unitCost: 18.50,
    totalCost: 18.50,
    usedAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    notes: 'Minwax stain'
  },
  {
    id: 'MAT-0003',
    jobId: 'JOB-0001',
    inventoryItemId: undefined,
    description: 'Polyurethane finish',
    quantity: 1,
    unitCost: 22.00,
    totalCost: 22.00,
    usedAt: Date.now() - (1 * 24 * 60 * 60 * 1000)
  }
]

export const useMaterialCostStore = create<MaterialCostState>()(
  persist(
    (set, get) => ({
      jobMaterials: mockJobMaterials,

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
      },

      updateJobMaterial: (id, updates) => {
        set((state) => ({
          jobMaterials: state.jobMaterials.map((material) => {
            if (material.id === id) {
              const updatedMaterial = { ...material, ...updates }
              // Recalculate total cost if quantity or unit cost changed
              if (updates.quantity !== undefined || updates.unitCost !== undefined) {
                updatedMaterial.totalCost = updatedMaterial.quantity * updatedMaterial.unitCost
              }
              return updatedMaterial
            }
            return material
          })
        }))
      },

      deleteJobMaterial: (id) => {
        set((state) => ({
          jobMaterials: state.jobMaterials.filter((material) => material.id !== id)
        }))
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
      version: 1
    }
  )
)
