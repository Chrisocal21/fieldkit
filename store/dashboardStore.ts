import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userScopedStorage } from '@/lib/userStorage'

export type WidgetId =
  | 'jobStatus'
  | 'schedule'
  | 'recentActivity'
  | 'topClients'
  | 'lowStock'
  | 'invoices'
  | 'quotePipeline'
  | 'team'

export const WIDGET_META: Record<WidgetId, { label: string; description: string }> = {
  jobStatus:     { label: 'Job Status',           description: 'Count of jobs by current status' },
  schedule:      { label: 'Upcoming Schedule',    description: '7-day calendar strip with due jobs' },
  recentActivity:{ label: 'Recent Activity',      description: 'Jobs updated in the last 7 days' },
  topClients:    { label: 'Top Clients',           description: 'Clients ranked by completed revenue' },
  lowStock:      { label: 'Low Stock Alerts',      description: 'Inventory items below threshold' },
  invoices:      { label: 'Outstanding Invoices',  description: 'Unpaid and overdue invoices' },
  quotePipeline: { label: 'Quote Pipeline',        description: 'Quote counts and value by status' },
  team:          { label: 'Team Overview',         description: 'Active members and their job load' },
}

const DEFAULT_WIDGETS: Record<WidgetId, boolean> = {
  jobStatus:      true,
  schedule:       true,
  recentActivity: true,
  topClients:     true,
  lowStock:       true,
  invoices:       true,
  quotePipeline:  true,
  team:           true,
}

interface DashboardState {
  widgets: Record<WidgetId, boolean>
  toggleWidget: (id: WidgetId) => void
  resetWidgets: () => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      widgets: { ...DEFAULT_WIDGETS },
      toggleWidget: (id) =>
        set((state) => ({ widgets: { ...state.widgets, [id]: !state.widgets[id] } })),
      resetWidgets: () => set({ widgets: { ...DEFAULT_WIDGETS } }),
    }),
    {
      name: 'fieldkit-dashboard',
      storage: userScopedStorage,
    }
  )
)
