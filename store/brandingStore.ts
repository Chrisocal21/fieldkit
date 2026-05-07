import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { userScopedStorage } from '@/lib/userStorage'

export type DocumentLayoutType = 'classic' | 'modern' | 'minimal' | 'bold'

export interface BrandingColors {
  primary: string        // Main brand color (headers, accents)
  secondary: string      // Secondary elements
  text: string          // Primary text color
  textLight: string     // Secondary text color
  background: string    // Background color
  border: string        // Border color
  accent: string        // Accent color for totals, CTAs
}

export interface PaymentInfo {
  venmo?: string
  paypal?: string
  cashApp?: string
  zelle?: string
  bankDetails?: string
  qrCodeText?: string   // URL to encode in QR (Linktree, website, etc.)
  qrCodeUrl?: string    // Generated QR code image (base64)
}

export interface BrandingPreset {
  id: string
  name: string
  
  // Logo
  logoUrl?: string              // Base64 or URL
  logoPosition: 'left' | 'center' | 'right'
  logoWidth: number             // in pixels
  
  // Colors
  colors: BrandingColors
  
  // Layout
  layoutType: DocumentLayoutType
  
  // Typography
  fontFamily: 'Helvetica' | 'Times' | 'Courier' | 'Georgia' | 'Arial'
  fontSize: {
    title: number              // Main title size
    heading: number            // Section headings
    body: number              // Normal text
    small: number             // Fine print
  }
  
  // Business Info (optional - can be included in documents)
  businessName?: string
  businessAddress?: string
  businessPhone?: string
  businessEmail?: string
  businessWebsite?: string
  
  // Footer text
  footerText?: string          // Terms, thank you message, etc.
  
  // Payment Information
  paymentInfo?: PaymentInfo
  
  // Additional styling
  showBorders: boolean         // Show table borders
  accentColor: string         // For highlights, totals (deprecated - use colors.accent)
  
  isDefault: boolean          // Is this the default preset?
  createdAt: number
  updatedAt: number
}

interface BrandingState {
  presets: BrandingPreset[]
  
  // CRUD operations
  createPreset: (data: Omit<BrandingPreset, 'id' | 'createdAt' | 'updatedAt'>) => BrandingPreset
  updatePreset: (id: string, updates: Partial<BrandingPreset>) => void
  deletePreset: (id: string) => void
  duplicatePreset: (id: string, newName: string) => BrandingPreset
  
  // Getters
  getPresetById: (id: string) => BrandingPreset | undefined
  getDefaultPreset: () => BrandingPreset
  setDefaultPreset: (id: string) => void
  
  // Logo management
  updateLogo: (presetId: string, logoUrl: string) => void
  removeLogo: (presetId: string) => void
}

// Default color schemes for presets
const defaultColors: BrandingColors = {
  primary: '#1e40af',        // Professional Navy Blue
  secondary: '#475569',      // Slate Gray
  text: '#1e293b',          // Dark slate
  textLight: '#64748b',     // Medium gray
  background: '#ffffff',     // White
  border: '#cbd5e1',        // Light slate
  accent: '#3b82f6'         // Bright blue accent
}

const modernColors: BrandingColors = {
  primary: '#7c3aed',        // Vibrant Purple
  secondary: '#ec4899',      // Hot Pink
  text: '#18181b',          // Near black
  textLight: '#71717a',     // Zinc gray
  background: '#fafafa',     // Off-white
  border: '#e4e4e7',        // Zinc border
  accent: '#a855f7'         // Purple accent
}

const minimalColors: BrandingColors = {
  primary: '#000000',        // Pure Black
  secondary: '#525252',      // Neutral gray
  text: '#000000',          // Black
  textLight: '#a3a3a3',     // Light gray
  background: '#ffffff',     // Pure White
  border: '#e5e5e5',        // Subtle gray
  accent: '#404040'         // Dark gray accent
}

const boldColors: BrandingColors = {
  primary: '#dc2626',        // Bright Red
  secondary: '#f97316',      // Orange
  text: '#18181b',          // Near black
  textLight: '#52525b',     // Zinc
  background: '#fef2f2',     // Light red tint
  border: '#fca5a5',        // Red border
  accent: '#ef4444'         // Red accent
}

// Built-in presets
const builtInPresets: BrandingPreset[] = [
  {
    id: 'classic-default',
    name: 'Classic',
    logoPosition: 'left',
    logoWidth: 140,
    colors: defaultColors,
    layoutType: 'classic',
    fontFamily: 'Times',
    fontSize: {
      title: 22,
      heading: 12,
      body: 10,
      small: 8
    },
    showBorders: true,
    accentColor: '#3b82f6',
    isDefault: true,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'modern-preset',
    name: 'Modern',
    logoPosition: 'center',
    logoWidth: 180,
    colors: modernColors,
    layoutType: 'modern',
    fontFamily: 'Arial',
    fontSize: {
      title: 26,
      heading: 13,
      body: 10,
      small: 8
    },
    showBorders: false,
    accentColor: '#a855f7',
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'minimal-preset',
    name: 'Minimal',
    logoPosition: 'right',
    logoWidth: 100,
    colors: minimalColors,
    layoutType: 'minimal',
    fontFamily: 'Helvetica',
    fontSize: {
      title: 18,
      heading: 10,
      body: 9,
      small: 7
    },
    showBorders: false,
    accentColor: '#404040',
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  },
  {
    id: 'bold-preset',
    name: 'Bold',
    logoPosition: 'left',
    logoWidth: 160,
    colors: boldColors,
    layoutType: 'bold',
    fontFamily: 'Georgia',
    fontSize: {
      title: 30,
      heading: 15,
      body: 11,
      small: 9
    },
    showBorders: true,
    accentColor: '#ef4444',
    isDefault: false,
    createdAt: Date.now(),
    updatedAt: Date.now()
  }
]

export const useBrandingStore = create<BrandingState>()(
  persist(
    (set, get) => ({
      presets: builtInPresets,

      createPreset: (data) => {
        const preset: BrandingPreset = {
          ...data,
          id: nanoid(),
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        
        set((state) => ({
          presets: [...state.presets, preset]
        }))
        
        return preset
      },

      updatePreset: (id, updates) => {
        set((state) => ({
          presets: state.presets.map((preset) =>
            preset.id === id
              ? { ...preset, ...updates, updatedAt: Date.now() }
              : preset
          )
        }))
      },

      deletePreset: (id) => {
        const preset = get().getPresetById(id)
        
        // Don't allow deleting built-in presets
        if (preset && ['classic-default', 'modern-preset', 'minimal-preset', 'bold-preset'].includes(id)) {
          console.warn('Cannot delete built-in presets')
          return
        }
        
        // If deleting the default, set classic as default
        if (preset?.isDefault) {
          get().setDefaultPreset('classic-default')
        }
        
        set((state) => ({
          presets: state.presets.filter((p) => p.id !== id)
        }))
      },

      duplicatePreset: (id, newName) => {
        const original = get().getPresetById(id)
        if (!original) {
          throw new Error('Preset not found')
        }
        
        const duplicate: BrandingPreset = {
          ...original,
          id: nanoid(),
          name: newName,
          isDefault: false,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        
        set((state) => ({
          presets: [...state.presets, duplicate]
        }))
        
        return duplicate
      },

      getPresetById: (id) => {
        return get().presets.find((p) => p.id === id)
      },

      getDefaultPreset: () => {
        const defaultPreset = get().presets.find((p) => p.isDefault)
        return defaultPreset || get().presets[0] // Fallback to first preset
      },

      setDefaultPreset: (id) => {
        set((state) => ({
          presets: state.presets.map((preset) => ({
            ...preset,
            isDefault: preset.id === id
          }))
        }))
      },

      updateLogo: (presetId, logoUrl) => {
        get().updatePreset(presetId, { logoUrl })
      },

      removeLogo: (presetId) => {
        get().updatePreset(presetId, { logoUrl: undefined })
      }
    }),
    {
      name: 'fieldkit-branding',
      storage: userScopedStorage,
    }
  )
)
