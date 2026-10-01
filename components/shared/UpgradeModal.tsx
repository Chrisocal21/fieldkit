'use client'

import Link from 'next/link'
import { type PlanTier } from '@/store/subscriptionStore'
import { PLAN_BY_TIER, formatPlanPrice } from '@/lib/plans'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  requiredPlan: PlanTier
  description?: string
}

// What you gain by moving up to each tier
const PLAN_HIGHLIGHTS: Record<PlanTier, string[]> = {
  free: [],
  starter: ['Up to 50 active jobs', 'Invoices & payments', 'Unlimited clients'],
  professional: ['Unlimited jobs', 'Up to 10 team members', 'Time tracking & inventory'],
  enterprise: ['Unlimited team members', 'Advanced reporting & analytics', 'Custom branding & API access'],
}

export default function UpgradeModal({ isOpen, onClose, feature, requiredPlan, description }: UpgradeModalProps) {
  if (!isOpen) return null

  const plan = PLAN_BY_TIER[requiredPlan]
  const highlights = PLAN_HIGHLIGHTS[requiredPlan]

  return (
    <div
      className="fixed inset-0 bg-black/50 dark:bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upgrade-title"
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl max-w-md w-full shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* Icon */}
          <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl flex items-center justify-center mb-4">
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>

          {/* Content */}
          <h2 id="upgrade-title" className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Upgrade to {plan.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {description || `${feature} is available on the ${plan.name} plan and above.`}
          </p>

          {/* Feature highlights */}
          {highlights.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                With the {plan.name} plan you get:
              </p>
              <ul className="space-y-2">
                {highlights.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                    <svg className="w-4 h-4 flex-shrink-0 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Pricing */}
          <div className="flex items-baseline gap-2 mb-6">
            <span className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white">{formatPlanPrice(plan)}</span>
            <span className="text-gray-500 dark:text-gray-400">/month</span>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              Maybe later
            </button>
            <Link
              href="/plans"
              onClick={onClose}
              className="flex-1 inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              See plans
            </Link>
          </div>

          {/* Note */}
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
            14-day free trial &middot; Cancel anytime
          </p>
        </div>
      </div>
    </div>
  )
}
