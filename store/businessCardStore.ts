import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { userScopedStorage } from '@/lib/userStorage'

export interface BusinessCardProfile {
  id: string
  name: string
  title: string
  company: string
  email: string
  phone: string
  website: string
  theme: 'light' | 'dark' | 'blue'
  createdAt: string
  profileName: string // Name of the profile for easy selection
}

interface BusinessCardState {
  profiles: BusinessCardProfile[]
  addProfile: (profile: Omit<BusinessCardProfile, 'id' | 'createdAt'>) => void
  updateProfile: (id: string, updates: Partial<BusinessCardProfile>) => void
  deleteProfile: (id: string) => void
  getProfileById: (id: string) => BusinessCardProfile | undefined
}

export const useBusinessCardStore = create<BusinessCardState>()(
  persist(
    (set, get) => ({
      profiles: [],

      addProfile: (profile) => {
        set((state) => ({
          profiles: [
            ...state.profiles,
            {
              ...profile,
              id: nanoid(),
              createdAt: new Date().toISOString(),
            },
          ],
        }))
      },

      updateProfile: (id, updates) => {
        set((state) => ({
          profiles: state.profiles.map((profile) =>
            profile.id === id ? { ...profile, ...updates } : profile
          ),
        }))
      },

      deleteProfile: (id) => {
        set((state) => ({
          profiles: state.profiles.filter((profile) => profile.id !== id),
        }))
      },

      getProfileById: (id) => {
        return get().profiles.find((profile) => profile.id === id)
      },
    }),
    {
      name: 'fieldkit-business-cards',
      storage: userScopedStorage,
      version: 1,
      migrate: (state: any) => state,
    }
  )
)
