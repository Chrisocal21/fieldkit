'use client'

import { useSubscriptionStore, PLAN_LIMITS } from '@/store/subscriptionStore'
import Link from 'next/link'

export default function PlansPage() {
  const { currentPlan, isLifetime } = useSubscriptionStore()

  const plans = [
    {
      name: 'Free',
      tier: 'free' as const,
      price: '$0',
      description: 'Perfect for trying out Fieldkit',
      features: [
        `${PLAN_LIMITS.free.maxJobs} active jobs`,
        `${PLAN_LIMITS.free.maxClients} clients`,
        'Quote generation',
        'Basic scheduling',
        'Mobile app access',
      ],
      cta: 'Current Plan',
      highlighted: false,
    },
    {
      name: 'Starter',
      tier: 'starter' as const,
      price: '$29',
      period: '/month',
      description: 'For growing field service businesses',
      features: [
        `${PLAN_LIMITS.starter.maxJobs} active jobs`,
        'Unlimited clients',
        'Invoices & payments',
        'Email notifications',
        'Quote templates',
        'Basic reporting',
      ],
      cta: 'Upgrade to Starter',
      highlighted: false,
    },
    {
      name: 'Professional',
      tier: 'professional' as const,
      price: '$79',
      period: '/month',
      description: 'For teams that need full control',
      features: [
        'Unlimited jobs',
        'Unlimited clients',
        `Up to ${PLAN_LIMITS.professional.maxTeamMembers} team members`,
        'Inventory management',
        'Time tracking',
        'Advanced reporting',
        'Priority support',
      ],
      cta: 'Upgrade to Professional',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      tier: 'enterprise' as const,
      price: '$149',
      period: '/month',
      description: 'For large teams with custom needs',
      features: [
        'Unlimited everything',
        'Custom branding',
        'API access',
        'Advanced analytics',
        'Dedicated support',
        'Custom integrations',
        'SLA guarantee',
      ],
      cta: 'Upgrade to Enterprise',
      highlighted: false,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Start free and scale as your business grows. All plans include mobile access and cloud sync.
          </p>
          {isLifetime && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-semibold">
              ✨ You have Lifetime {currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)} Access
            </div>
          )}
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan === plan.tier
            
            return (
              <div
                key={plan.tier}
                className={`relative rounded-2xl border-2 p-8 shadow-sm transition-all ${
                  plan.highlighted
                    ? 'border-blue-600 dark:border-blue-500 shadow-xl'
                    : 'border-gray-200 dark:border-gray-700 hover:shadow-lg'
                } bg-white dark:bg-gray-800`}
              >
                {plan.highlighted && (
                  <div className="mb-4 -mx-8 -mt-8 px-8 pt-3 pb-2 bg-blue-600 dark:bg-blue-500 rounded-t-2xl">
                    <div className="text-center">
                      <span className="text-white text-sm font-semibold">
                        ⭐ Most Popular
                      </span>
                    </div>
                  </div>
                )}

                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                    {plan.name}
                  </h3>
                  <div className="mt-4 flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900 dark:text-white">
                      {plan.price}
                    </span>
                    {plan.period && (
                      <span className="ml-1 text-xl text-gray-600 dark:text-gray-400">
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className="mt-4 text-sm text-gray-600 dark:text-gray-400">
                    {plan.description}
                  </p>
                </div>

                <ul className="mt-8 space-y-4">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <svg
                        className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <div className="mt-8">
                  {isCurrentPlan && !isLifetime ? (
                    <div className="w-full py-3 px-4 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white text-center font-semibold">
                      Current Plan
                    </div>
                  ) : isCurrentPlan && isLifetime ? (
                    <div className="w-full py-3 px-4 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white text-center font-semibold">
                      ✨ Lifetime Access
                    </div>
                  ) : (
                    <Link
                      href="/dashboard"
                      className={`block w-full py-3 px-4 rounded-lg text-center font-semibold transition-colors ${
                        plan.highlighted
                          ? 'bg-blue-600 hover:bg-blue-700 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white'
                      }`}
                    >
                      Contact Sales
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Promo Code CTA */}
        <div className="mt-16 text-center">
          <div className="inline-flex flex-col items-center gap-4 p-8 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
            <div className="flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                Have a promo code?
              </h3>
            </div>
            <p className="text-gray-600 dark:text-gray-400">
              Redeem your promotional code in Settings to unlock premium features
            </p>
            <Link
              href="/dashboard"
              className="px-6 py-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-semibold transition-colors"
            >
              Go to Settings
            </Link>
          </div>
        </div>

        {/* FAQ or Additional Info */}
        <div className="mt-16 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            All plans include 30-day money-back guarantee. Cancel anytime, no questions asked.
          </p>
        </div>
      </div>
    </div>
  )
}
