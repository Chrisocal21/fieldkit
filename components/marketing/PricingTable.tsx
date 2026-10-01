import Link from 'next/link'
import { PLANS, formatPlanPrice } from '@/lib/plans'
import { CheckIcon, MinusIcon } from './icons'

export default function PricingTable() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {PLANS.map((plan) => (
        <article
          key={plan.tier}
          className={`reveal relative flex flex-col rounded-2xl border bg-zinc-950 p-6 ${
            plan.highlighted ? 'border-cyan-400/50 shadow-[0_0_60px_-20px_rgba(34,211,238,0.35)]' : 'border-zinc-800'
          }`}
        >
          {plan.highlighted && (
            <p className="absolute -top-3 left-6 rounded-full bg-cyan-400 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-black">
              Most popular
            </p>
          )}

          <h3 className="font-display text-xl font-bold tracking-[-0.02em] text-white">{plan.name}</h3>
          <p className="mt-1 text-sm text-zinc-400">{plan.tagline}</p>

          <p className="mt-6 flex items-baseline gap-1.5">
            <span className="font-display text-4xl font-bold tracking-tight text-white">{formatPlanPrice(plan)}</span>
            <span className="text-sm text-zinc-400">/month</span>
          </p>
          <p className="mt-1 text-xs text-zinc-400">{plan.billing}</p>

          <Link
            href="/sign-up"
            className={`mt-6 inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-semibold transition ${
              plan.highlighted
                ? 'border-transparent bg-white text-black hover:bg-zinc-200'
                : 'border-white/20 text-white hover:bg-white/10'
            }`}
          >
            {plan.price === 0 ? 'Start free' : 'Get started'}
            <span className="sr-only"> with the {plan.name} plan</span>
          </Link>

          <ul className="mt-6 space-y-2.5 border-t border-zinc-800 pt-6 text-sm">
            {plan.features.map((feature) => (
              <li
                key={feature.label}
                className={`flex items-start gap-2.5 ${feature.included ? 'text-zinc-200' : 'text-zinc-500'}`}
              >
                {feature.included ? (
                  <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                ) : (
                  <MinusIcon className="mt-0.5 h-4 w-4 shrink-0 text-zinc-700" />
                )}
                <span>
                  {feature.label}
                  {!feature.included && <span className="sr-only"> (not included)</span>}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  )
}
