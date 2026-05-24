import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { userScopedStorage } from '@/lib/userStorage'

export type Theme = 'light' | 'dark' | 'system'

interface SettingsState {
  theme: Theme
  setTheme: (theme: Theme) => void
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
    }),
    {
      name: 'fieldkit-settings',
      storage: userScopedStorage,
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
