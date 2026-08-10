'use client'

import Link from 'next/link'
import { useSubscriptionStore, PLAN_LIMITS, type PlanTier } from '@/store/subscriptionStore'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  feature: string
  requiredPlan: PlanTier
  description?: string
}

export default function UpgradeModal({ isOpen, onClose, feature, requiredPlan, description }: UpgradeModalProps) {
  const currentPlan = useSubscriptionStore((state) => state.currentPlan)

  if (!isOpen) return null

  const planPrices: Record<PlanTier, string> = {
    free: '$0',
    starter: '$29',
    professional: '$79',
    enterprise: '$199',
  }

  const planColors: Record<PlanTier, string> = {
    free: 'gray',
    starter: 'blue',
    professional: 'violet',
    enterprise: 'amber',
  }

  const color = planColors[requiredPlan]

  return (
    <>
      <div
        className="fixed inset-0 bg-black/50 dark:bg-black/70 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-gray-900 rounded-2xl max-w-md w-full shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6">
            {/* Icon */}
            <div className={`w-16 h-16 bg-${color}-100 dark:bg-${color}-900/30 rounded-2xl flex items-center justify-center mb-4`}>
              <svg className={`w-8 h-8 text-${color}-600 dark:text-${color}-400`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>

            {/* Content */}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Upgrade to {requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              {description || `${feature} is available on the ${requiredPlan} plan and above.`}
            </p>

            {/* Feature highlights */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                With the {requiredPlan} plan you get:
              </p>
              <ul className="space-y-2">
                {requiredPlan === 'starter' && (
                  <>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Up to 50 active jobs
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Invoices & payments
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited clients
                    </li>
                  </>
                )}
                {requiredPlan === 'professional' && (
                  <>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited jobs
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Up to 10 team members
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Time tracking & inventory
                    </li>
                  </>
                )}
                {requiredPlan === 'enterprise' && (
                  <>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Unlimited team members
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Advanced reporting & analytics
                    </li>
                    <li className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Custom branding & API access
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Pricing */}
            <div className="flex items-baseline gap-2 mb-6">
              <span className="text-4xl font-bold text-gray-900 dark:text-white">{planPrices[requiredPlan]}</span>
              <span className="text-gray-500 dark:text-gray-400">/month</span>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-3 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-medium transition-colors"
              >
                Maybe Later
              </button>
              <Link
                href="/sign-up"
                className={`flex-1 px-4 py-3 text-center text-white bg-${color}-600 hover:bg-${color}-700 rounded-xl font-semibold transition-colors shadow-lg`}
              >
                Upgrade Now
              </Link>
            </div>

            {/* Note */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-4">
              14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
