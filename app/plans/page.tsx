'use client'

import { useState } from 'react'
import { useSubscriptionStore } from '@/store/subscriptionStore'
import { PLANS, formatPlanPrice, planLabel } from '@/lib/plans'
import SettingsModal from '@/components/shared/SettingsModal'
import ContactSalesModal from '@/components/shared/ContactSalesModal'

function CheckIcon() {
  return (
    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M5 13l4 4L19 7" />
    </svg>
  )
}

function MinusIcon() {
  return (
    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.25} d="M6 12h12" />
    </svg>
  )
}

export default function PlansPage() {
  const { currentPlan, isLifetime } = useSubscriptionStore()
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [contactSalesOpen, setContactSalesOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState('')

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Plans</h1>
        <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
          Start free and scale as your business grows. All plans include mobile access and cloud sync.
        </p>
        {isLifetime && (
          <p className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-sm font-medium text-blue-700 dark:text-blue-300">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            You have lifetime {planLabel(currentPlan)} access
          </p>
        )}
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.tier

          return (
            <div
              key={plan.tier}
              className={`relative flex flex-col rounded-2xl border p-6 bg-white dark:bg-gray-900 ${
                plan.highlighted
                  ? 'border-blue-500 dark:border-blue-400/60 shadow-[0_0_0_1px_rgba(8,145,178,0.15)]'
                  : 'border-gray-200 dark:border-gray-700'
              }`}
            >
              {plan.highlighted && (
                <p className="absolute -top-3 left-6 rounded-full bg-blue-600 dark:bg-blue-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white dark:text-black">
                  Most popular
                </p>
              )}

              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">{plan.name}</h2>
                {isCurrentPlan && (
                  <span className="rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-0.5 text-[11px] font-medium text-gray-600 dark:text-gray-300">
                    Current
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{plan.tagline}</p>

              <p className="mt-6 flex items-baseline gap-1.5">
                <span className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
                  {formatPlanPrice(plan)}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-500">/month</span>
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">{plan.billing}</p>

              <div className="mt-6">
                {isCurrentPlan && !isLifetime ? (
                  <div className="w-full py-2.5 px-4 rounded-lg border border-transparent bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 text-center text-sm font-semibold">
                    Current plan
                  </div>
                ) : isCurrentPlan && isLifetime ? (
                  <div className="w-full py-2.5 px-4 rounded-lg border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-center text-sm font-semibold">
                    Lifetime access
                  </div>
                ) : plan.price === 0 ? (
                  // Nothing to buy: Free is where every account starts
                  <div className="w-full py-2.5 px-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 text-center text-sm font-medium">
                    Included with every account
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setSelectedPlan(plan.name)
                      setContactSalesOpen(true)
                    }}
                    className={`w-full inline-flex items-center justify-center py-2.5 px-4 rounded-lg border text-sm font-semibold transition-colors ${
                      plan.highlighted
                        ? 'border-transparent bg-blue-600 hover:bg-blue-700 text-white'
                        : 'border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    Contact sales
                  </button>
                )}
              </div>

              <ul className="mt-6 space-y-2.5 border-t border-gray-200 dark:border-gray-700 pt-6 text-sm">
                {plan.features.map((feature) => (
                  <li
                    key={feature.label}
                    className={`flex items-start gap-2.5 ${
                      feature.included ? 'text-gray-700 dark:text-gray-300' : 'text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    {feature.included ? <CheckIcon /> : <MinusIcon />}
                    <span>
                      {feature.label}
                      {!feature.included && <span className="sr-only"> (not included)</span>}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
      </div>

      {/* Promo Code CTA */}
      <div className="mt-6 flex flex-col gap-4 rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
          </span>
          <div>
            <h2 className="font-sans text-base font-semibold tracking-normal text-gray-900 dark:text-white">
              Have a promo code?
            </h2>
            <p className="mt-0.5 text-sm text-gray-600 dark:text-gray-400">
              Redeem your promotional code in Settings to unlock premium features.
            </p>
          </div>
        </div>
        <button
          onClick={() => setSettingsOpen(true)}
          className="inline-flex flex-shrink-0 items-center justify-center px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          Go to Settings
        </button>
      </div>

      {/* Additional Info */}
      <p className="mt-6 text-sm text-gray-500 dark:text-gray-500">
        All plans include 30-day money-back guarantee. Cancel anytime, no questions asked.
      </p>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        initialTab="subscription"
      />

      {/* Contact Sales Modal */}
      <ContactSalesModal
        isOpen={contactSalesOpen}
        onClose={() => setContactSalesOpen(false)}
        selectedPlan={selectedPlan}
      />
    </div>
  )
}
