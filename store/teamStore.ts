import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface TeamMember {
  id: string
  name: string
  role: string
  createdAt: number
}

interface TeamState {
  members: TeamMember[]
  addMember: (member: Omit<TeamMember, 'id' | 'createdAt'>) => void
  updateMember: (id: string, updates: Partial<TeamMember>) => void
  removeMember: (id: string) => void
}

const mockMembers: TeamMember[] = [
  {
    id: 'TEAM-001',
    name: 'Alex Chen',
    role: 'Laser Operator',
    createdAt: Date.now() - 86400000 * 90,
  },
  {
    id: 'TEAM-002',
    name: 'Jordan Martinez',
    role: 'Print Specialist',
    createdAt: Date.now() - 86400000 * 60,
  },
]

export const useTeamStore = create<TeamState>()(
  persist(
    (set, get) => ({
      members: mockMembers,
      
      addMember: (memberData) => {
        const members = get().members
        const newMember: TeamMember = {
          ...memberData,
          id: `TEAM-${String(members.length + 1).padStart(3, '0')}`,
          createdAt: Date.now(),
        }
        set((state) => ({ members: [...state.members, newMember] }))
      },
      
      updateMember: (id, updates) => {
        set((state) => ({
          members: state.members.map((member) =>
            member.id === id ? { ...member, ...updates } : member
          ),
        }))
      },
      
      removeMember: (id) => {
        set((state) => ({
          members: state.members.filter((member) => member.id !== id),
        }))
      },
    }),
    {
      name: 'fieldkit-team',
    }
  )
)
