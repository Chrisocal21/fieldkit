'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSubscriptionStore } from '@/store/subscriptionStore'

export default function DowngradedBanner() {
  const { currentPlan, isTrialActive, isLifetime } = useSubscriptionStore()
  const [mounted, setMounted] = useState(false)
  const [wasDowngraded, setWasDowngraded] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    setMounted(true)
    // Check if user was just downgraded from a trial
    const lastPlan = localStorage.getItem('fieldkit-last-plan')
    if (lastPlan && lastPlan !== 'free' && currentPlan === 'free' && !isTrialActive && !isLifetime) {
      setWasDowngraded(true)
    }
    // Store current plan for future comparison
    localStorage.setItem('fieldkit-last-plan', currentPlan)
  }, [currentPlan, isTrialActive, isLifetime])

  if (!mounted || !wasDowngraded || dismissed || isLifetime) {
    return null
  }

  return (
    <div className="bg-rose-50 dark:bg-rose-900/20 border-b border-rose-200 dark:border-rose-800 px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <svg
            className="w-5 h-5 text-rose-600 dark:text-rose-400 flex-shrink-0 mt-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <p className="text-sm font-semibold text-rose-800 dark:text-rose-200">
              Your trial has ended
            </p>
            <p className="text-sm text-rose-700 dark:text-rose-300 mt-0.5">
              You've been moved to the Free plan. Your data is safe — upgrade anytime to regain access to invoices, team management, and unlimited jobs.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/sign-up"
            className="text-sm font-semibold px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors whitespace-nowrap"
          >
            Upgrade Now
          </Link>
          <button
            onClick={() => setDismissed(true)}
            className="text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300 transition-colors"
            aria-label="Dismiss"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
