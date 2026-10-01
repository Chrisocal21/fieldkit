import type { PlanTier } from '@/store/subscriptionStore'

/**
 * The one place plan names, prices, and feature lists live.
 * The landing page, /plans, the upgrade modal, settings, and the contact
 * form all read from here, so a price only ever needs changing once.
 *
 * What each tier actually unlocks in the app is enforced separately by
 * PLAN_LIMITS in store/subscriptionStore.ts. Keep the two in step.
 */

export interface PlanFeature {
  label: string
  included: boolean
}

export interface Plan {
  tier: PlanTier
  name: string
  /** USD per month */
  price: number
  tagline: string
  billing: string
  features: PlanFeature[]
  highlighted?: boolean
}

const yes = (label: string): PlanFeature => ({ label, included: true })
const no = (label: string): PlanFeature => ({ label, included: false })

export const PLANS: Plan[] = [
  {
    tier: 'free',
    name: 'Free',
    price: 0,
    tagline: 'Get started for free',
    billing: 'Forever free',
    features: [
      yes('Up to 5 active jobs'),
      yes('Up to 10 clients'),
      yes('Basic quotes'),
      yes('Mobile app'),
      no('Invoices'),
      no('Team members'),
      no('Inventory'),
    ],
  },
  {
    tier: 'starter',
    name: 'Starter',
    price: 29,
    tagline: 'For solo contractors',
    billing: 'Billed monthly',
    features: [
      yes('Up to 50 active jobs'),
      yes('Unlimited clients'),
      yes('Quotes & invoices'),
      yes('Schedule & calendar'),
      yes('Mobile app'),
      no('Team & time tracking'),
      no('Inventory'),
    ],
  },
  {
    tier: 'professional',
    name: 'Professional',
    price: 79,
    tagline: 'For growing teams',
    billing: 'Billed monthly',
    highlighted: true,
    features: [
      yes('Unlimited active jobs'),
      yes('Unlimited clients'),
      yes('Quotes & invoices'),
      yes('Schedule & calendar'),
      yes('Mobile app'),
      yes('Up to 10 team members'),
      yes('Time tracking'),
      yes('Inventory management'),
    ],
  },
  {
    tier: 'enterprise',
    name: 'Enterprise',
    price: 199,
    tagline: 'For large operations',
    billing: 'Billed monthly',
    features: [
      yes('Everything in Professional'),
      yes('Unlimited team members'),
      yes('Advanced reporting & analytics'),
      yes('Custom branding'),
      yes('API access'),
      yes('Dedicated account manager'),
      yes('Custom integrations'),
      yes('SLA guarantee'),
    ],
  },
]

export const PLAN_BY_TIER = Object.fromEntries(PLANS.map((p) => [p.tier, p])) as Record<PlanTier, Plan>

export const formatPlanPrice = (plan: Plan) => `$${plan.price}`

export const planLabel = (tier: PlanTier) => PLAN_BY_TIER[tier].name
