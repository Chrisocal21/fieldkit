'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSubscriptionStore } from '@/store/subscriptionStore'

export default function TrialBanner() {
  const { currentPlan, trialEndsAt, isTrialActive, endTrial } = useSubscriptionStore()
  const [daysRemaining, setDaysRemaining] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted || !isTrialActive || !trialEndsAt) return

    const checkTrial = () => {
      const now = Date.now()
      const remaining = trialEndsAt - now

      if (remaining <= 0) {
        // Trial expired - downgrade to free
        endTrial()
        return
      }

      const days = Math.ceil(remaining / (1000 * 60 * 60 * 24))
      setDaysRemaining(days)
    }

    checkTrial()
    const interval = setInterval(checkTrial, 1000 * 60 * 60) // Check hourly

    return () => clearInterval(interval)
  }, [mounted, isTrialActive, trialEndsAt, endTrial])

  if (!mounted || !isTrialActive || currentPlan === 'free' || daysRemaining === null) {
    return null
  }

  const isExpiringSoon = daysRemaining <= 3
  const planName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)

  return (
    <div
      className={`${
        isExpiringSoon
          ? 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800'
          : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
      } border-b px-4 py-2`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <svg
            className={`w-5 h-5 ${
              isExpiringSoon
                ? 'text-amber-600 dark:text-amber-400'
                : 'text-blue-600 dark:text-blue-400'
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p
            className={`text-sm font-medium ${
              isExpiringSoon
                ? 'text-amber-800 dark:text-amber-200'
                : 'text-blue-800 dark:text-blue-200'
            }`}
          >
            {daysRemaining === 1 ? (
              <>
                <span className="font-bold">Last day</span> of your {planName} trial
              </>
            ) : (
              <>
                <span className="font-bold">{daysRemaining} days left</span> in your {planName} trial
              </>
            )}
            {isExpiringSoon && (
              <span className="ml-1">— Add payment to continue after trial</span>
            )}
          </p>
        </div>
        <Link
          href="/sign-up"
          className={`text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors ${
            isExpiringSoon
              ? 'bg-amber-600 hover:bg-amber-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          Upgrade Now
        </Link>
      </div>
    </div>
  )
}
