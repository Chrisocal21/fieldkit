import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import api from '@/lib/api'

export type PlanTier = 'free' | 'starter' | 'professional' | 'enterprise'

export interface PlanLimits {
  maxJobs: number | null // null = unlimited
  maxClients: number | null
  maxTeamMembers: number | null
  hasInvoices: boolean
  hasInventory: boolean
  hasTimeTracking: boolean
  hasAdvancedReporting: boolean
  hasCustomBranding: boolean
  hasApiAccess: boolean
}

export const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  free: {
    maxJobs: 5,
    maxClients: 10,
    maxTeamMembers: 0,
    hasInvoices: false,
    hasInventory: false,
    hasTimeTracking: false,
    hasAdvancedReporting: false,
    hasCustomBranding: false,
    hasApiAccess: false,
  },
  starter: {
    maxJobs: 50,
    maxClients: null,
    maxTeamMembers: 0,
    hasInvoices: true,
    hasInventory: false,
    hasTimeTracking: false,
    hasAdvancedReporting: false,
    hasCustomBranding: false,
    hasApiAccess: false,
  },
  professional: {
    maxJobs: null,
    maxClients: null,
    maxTeamMembers: 10,
    hasInvoices: true,
    hasInventory: true,
    hasTimeTracking: true,
    hasAdvancedReporting: false,
    hasCustomBranding: false,
    hasApiAccess: false,
  },
  enterprise: {
    maxJobs: null,
    maxClients: null,
    maxTeamMembers: null,
    hasInvoices: true,
    hasInventory: true,
    hasTimeTracking: true,
    hasAdvancedReporting: true,
    hasCustomBranding: true,
    hasApiAccess: true,
  },
}

interface SubscriptionState {
  currentPlan: PlanTier
  trialEndsAt: number | null // timestamp
  isTrialActive: boolean
  isLifetime: boolean // if true, plan can't be downgraded
  
  // Actions
  setPlan: (plan: PlanTier) => void
  startTrial: (plan: PlanTier, days?: number) => void
  endTrial: () => void
  redeemPromoCode: (code: string) => Promise<{ success: boolean; message: string }>
  
  // Computed
  getLimits: () => PlanLimits
  canAddJob: (currentJobCount: number) => boolean
  canAddClient: (currentClientCount: number) => boolean
  canAddTeamMember: (currentTeamCount: number) => boolean
  hasFeature: (feature: keyof Omit<PlanLimits, 'maxJobs' | 'maxClients' | 'maxTeamMembers'>) => boolean
  getRemainingJobs: (currentJobCount: number) => number | null
  getRemainingClients: (currentClientCount: number) => number | null
  getRemainingTeamMembers: (currentTeamCount: number) => number | null
}

// Helper to sync subscription to cloud
async function syncToCloud(state: Pick<SubscriptionState, 'currentPlan' | 'trialEndsAt' | 'isTrialActive' | 'isLifetime'>) {
  if (typeof window === 'undefined') return
  try {
    await api.subscription.update({
      currentPlan: state.currentPlan,
      trialEndsAt: state.trialEndsAt,
      isTrialActive: state.isTrialActive,
      isLifetime: state.isLifetime,
    })
  } catch (e) {
    console.error('[subscription] Failed to sync to cloud', e)
  }
}

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      currentPlan: 'free',
      trialEndsAt: null,
      isTrialActive: false,
      isLifetime: false,

      setPlan: (plan) => {
        const { isLifetime } = get()
        if (isLifetime) {
          console.warn('[subscription] Cannot change plan - this is a lifetime subscription')
          return
        }
        set({ currentPlan: plan, isTrialActive: false, trialEndsAt: null })
        syncToCloud({ currentPlan: plan, isTrialActive: false, trialEndsAt: null, isLifetime: false })
      },

      startTrial: (plan, days = 14) => {
        const { isLifetime } = get()
        if (isLifetime) {
          console.warn('[subscription] Cannot start trial - this is a lifetime subscription')
          return
        }
        const endsAt = Date.now() + days * 24 * 60 * 60 * 1000
        set({ currentPlan: plan, trialEndsAt: endsAt, isTrialActive: true })
        syncToCloud({ currentPlan: plan, trialEndsAt: endsAt, isTrialActive: true, isLifetime: false })
      },

      endTrial: () => {
        const { currentPlan, trialEndsAt, isLifetime } = get()
        if (isLifetime) return // Don't downgrade lifetime subs
        if (trialEndsAt && Date.now() > trialEndsAt) {
          set({ currentPlan: 'free', isTrialActive: false })
          syncToCloud({ currentPlan: 'free', isTrialActive: false, trialEndsAt: null, isLifetime: false })
        }
      },

      redeemPromoCode: async (code: string) => {
        try {
          const result = await api.subscription.redeemPromoCode(code)
          if (result?.success) {
            // Refresh subscription from cloud
            const freshSub = await api.subscription.get()
            if (freshSub) {
              set({
                currentPlan: freshSub.currentPlan,
                isLifetime: freshSub.isLifetime,
                isTrialActive: false,
                trialEndsAt: null,
              })
            }
            return { success: true, message: result.message || 'Promo code redeemed successfully!' }
          }
          return { success: false, message: result?.message || 'Invalid promo code' }
        } catch (e) {
          console.error('[subscription] Failed to redeem promo code', e)
          return { success: false, message: 'Failed to redeem code. Please try again.' }
        }
      },

      getLimits: () => {
        const { currentPlan } = get()
        return PLAN_LIMITS[currentPlan]
      },

      canAddJob: (currentJobCount) => {
        const limits = get().getLimits()
        if (limits.maxJobs === null) return true
        return currentJobCount < limits.maxJobs
      },

      canAddClient: (currentClientCount) => {
        const limits = get().getLimits()
        if (limits.maxClients === null) return true
        return currentClientCount < limits.maxClients
      },

      canAddTeamMember: (currentTeamCount) => {
        const limits = get().getLimits()
        if (limits.maxTeamMembers === null) return true
        return currentTeamCount < limits.maxTeamMembers
      },

      hasFeature: (feature) => {
        const limits = get().getLimits()
        return limits[feature]
      },

      getRemainingJobs: (currentJobCount) => {
        const limits = get().getLimits()
        if (limits.maxJobs === null) return null
        return Math.max(0, limits.maxJobs - currentJobCount)
      },

      getRemainingClients: (currentClientCount) => {
        const limits = get().getLimits()
        if (limits.maxClients === null) return null
        return Math.max(0, limits.maxClients - currentClientCount)
      },

      getRemainingTeamMembers: (currentTeamCount) => {
        const limits = get().getLimits()
        if (limits.maxTeamMembers === null) return null
        return Math.max(0, limits.maxTeamMembers - currentTeamCount)
      },
    }),
    {
      name: 'fieldkit-subscription',
    }
  )
)
