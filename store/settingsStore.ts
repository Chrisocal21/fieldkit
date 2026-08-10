import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userScopedStorage } from '@/lib/userStorage'

export type Theme = 'light' | 'dark' | 'system'

export interface NotificationSettings {
  jobUpdates: boolean
  quoteActivity: boolean
  teamActivity: boolean
  lowStock: boolean
}

interface SettingsState {
  theme: Theme
  setTheme: (theme: Theme) => void

  // Document defaults
  defaultTaxRate: number        // stored as decimal e.g. 0.08 = 8%
  defaultPaymentTerms: number   // days e.g. 30
  defaultQuoteExpiry: number    // days e.g. 30
  invoicePrefix: string
  quotePrefix: string
  currency: string

  // Notifications
  notifications: NotificationSettings

  // Setters
  setDefaultTaxRate: (rate: number) => void
  setDefaultPaymentTerms: (days: number) => void
  setDefaultQuoteExpiry: (days: number) => void
  setInvoicePrefix: (prefix: string) => void
  setQuotePrefix: (prefix: string) => void
  setCurrency: (currency: string) => void
  setNotification: (key: keyof NotificationSettings, value: boolean) => void

  // UI state
  sidebarCollapsed: boolean
  setSidebarCollapsed: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      theme: 'system',
      setTheme: (theme) => {
        set({ theme })
        // Write to plain key so the anti-flash script can read it before Clerk/Zustand loads
        if (typeof window !== 'undefined') {
          localStorage.setItem('fieldkit-theme', theme)
        }
        applyTheme(theme)
      },

      // Document defaults
      defaultTaxRate: 0.08,
      defaultPaymentTerms: 30,
      defaultQuoteExpiry: 30,
      invoicePrefix: 'INV-',
      quotePrefix: 'QUO-',
      currency: 'USD',

      // Notifications
      notifications: {
        jobUpdates: true,
        quoteActivity: true,
        teamActivity: false,
        lowStock: true,
      },

      setDefaultTaxRate: (rate) => set({ defaultTaxRate: rate }),
      setDefaultPaymentTerms: (days) => set({ defaultPaymentTerms: days }),
      setDefaultQuoteExpiry: (days) => set({ defaultQuoteExpiry: days }),
      setInvoicePrefix: (prefix) => set({ invoicePrefix: prefix }),
      setQuotePrefix: (prefix) => set({ quotePrefix: prefix }),
      setCurrency: (currency) => set({ currency }),
      setNotification: (key, value) =>
        set((s) => ({ notifications: { ...s.notifications, [key]: value } })),

      sidebarCollapsed: false,
      setSidebarCollapsed: (v) => set({ sidebarCollapsed: v }),
    }),
    {
      name: 'fieldkit-settings',
      storage: userScopedStorage,
      version: 1,
      migrate: (state: any) => state,
      onRehydrateStorage: () => (state) => {
        if (state) {
          applyTheme(state.theme)
        }
      },
    }
  )
)

function applyTheme(theme: Theme) {
  const root = document.documentElement
  
  if (theme === 'system') {
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    if (systemPrefersDark) {
      root.classList.add('dark')
    } else {
      root.classList.remove('dark')
    }
  } else if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
}

// Listen for system theme changes when theme is set to 'system'
if (typeof window !== 'undefined') {
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    const currentTheme = useSettingsStore.getState().theme
    if (currentTheme === 'system') {
      applyTheme('system')
    }
  })
}
