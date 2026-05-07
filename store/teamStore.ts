import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { userScopedStorage } from '@/lib/userStorage'
import api from '@/lib/api'

export interface TeamMember {
  id: string
  name: string
  role: string // e.g., "Lead Plumber", "Electrician", "Painter", "Helper"
  hourlyRate: number // For labor cost calculations
  phone?: string
  email?: string
  color: string // For calendar/visual identification (hex color)
  active: boolean // To hide inactive/former employees
  createdAt: number
  updatedAt: number
}

interface TeamState {
  members: TeamMember[]
  addMember: (member: Omit<TeamMember, 'id' | 'createdAt' | 'updatedAt'>) => string
  updateMember: (id: string, updates: Partial<TeamMember>) => void
  deleteMember: (id: string) => void
  toggleActive: (id: string) => void
  getMemberById: (id: string) => TeamMember | undefined
  getActiveMembers: () => TeamMember[]
  searchMembers: (query: string) => TeamMember[]
}

// Predefined color palette for team members
const TEAM_COLORS = [
  '#3B82F6', // blue
  '#10B981', // green
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#14B8A6', // teal
  '#F97316', // orange
]

let colorIndex = 0

const getNextColor = (): string => {
  const color = TEAM_COLORS[colorIndex % TEAM_COLORS.length]
  colorIndex++
  return color
}

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      members: [],

      addMember: (member) => {
        const id = nanoid()
        const now = Date.now()
        const newMember: TeamMember = {
          ...member,
          id,
          color: member.color || getNextColor(),
          createdAt: now,
          updatedAt: now,
        }
        set((state) => ({
          members: [...state.members, newMember],
        }))
        api.team.create(newMember)
        return id
      },

      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id
              ? { ...member, ...updates, updatedAt: Date.now() }
              : member
          ),
        }))
        api.team.update(id, { ...updates, updatedAt: Date.now() })
      },

      deleteMember: (id) => {
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        }))
        api.team.delete(id)
      },

      toggleActive: (id) => {
        const member = get().members.find(m => m.id === id)
        const newActive = !(member?.active ?? true)
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id
              ? { ...member, active: newActive, updatedAt: Date.now() }
              : member
          ),
        }))
        api.team.update(id, { active: newActive, updatedAt: Date.now() })
      },

      getMemberById: (id) => {
        return get().members.find((member) => member.id === id)
      },

      getActiveMembers: () => {
        return get().members.filter((member) => member.active)
      },

      searchMembers: (query) => {
        const lowerQuery = query.toLowerCase().trim()
        if (!lowerQuery) return get().members

        return get().members.filter(
          (member) =>
            member.name.toLowerCase().includes(lowerQuery) ||
            member.role.toLowerCase().includes(lowerQuery) ||
            member.email?.toLowerCase().includes(lowerQuery) ||
            member.phone?.includes(query)
        )
      },
    }),
    {
      name: 'fieldkit-team-storage',
      storage: userScopedStorage,
      version: 2,
    }
  )
)
