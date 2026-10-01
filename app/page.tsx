import type { Metadata, Viewport } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@clerk/nextjs/server'
import SiteHeader from '@/components/marketing/SiteHeader'
import SiteFooter from '@/components/marketing/SiteFooter'
import BoardPreview from '@/components/marketing/BoardPreview'
import FeatureGrid from '@/components/marketing/FeatureGrid'
import HowItWorks from '@/components/marketing/HowItWorks'
import PricingTable from '@/components/marketing/PricingTable'
import ContactButton from '@/components/marketing/ContactButton'
import { ArrowRightIcon } from '@/components/marketing/icons'

export const metadata: Metadata = {
  title: { absolute: 'FieldKit: run your service business without the chaos' },
  description:
    'Jobs, quotes, invoices, and scheduling in one lightweight app built for crews in the field. Free for up to 5 active jobs.',
  alternates: { canonical: '/' },
}

export const viewport: Viewport = {
  themeColor: '#000000',
}

const stats = [
  { value: '7', label: 'tabs on every job, from quotes to time logs' },
  { value: '3', label: 'calendar views: day, week, and month' },
  { value: '$0', label: 'to start. It stays free at 5 active jobs.' },
  { value: '1', label: 'developer. Bug reports go to the person who wrote the bug.' },
]

function SectionHeading({
  eyebrow,
  title,
  children,
  id,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
  id: string
}) {
  return (
    <div className="reveal mb-10 max-w-2xl">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-cyan-400">{eyebrow}</p>
      <h2 id={id} className="text-3xl font-bold tracking-tight text-white md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-relaxed text-zinc-300 text-pretty">{children}</p>
    </div>
  )
}

export default async function LandingPage() {
  // Signed-in users never see the marketing page
  const { userId } = await auth()
  if (userId) redirect('/dashboard')

  return (
    <div data-surface="marketing" className="dark min-h-screen bg-black text-white antialiased">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded-lg focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
      >
        Skip to content
      </a>

      <SiteHeader />

      <main id="main">
        {/* Hero */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
          <div
            className="absolute inset-0"
            aria-hidden="true"
            style={{
              background:
                'radial-gradient(ellipse 70% 45% at 50% 28%, rgba(34,211,238,0.13) 0%, transparent 70%)',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" aria-hidden="true" />

          <div className="relative mx-auto max-w-4xl px-4 pb-14 pt-16 text-center sm:px-6 md:pb-16 md:pt-24 lg:px-8">
            <a
              href="#pricing"
              className="animate-fade-up mb-8 inline-flex min-h-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 py-1.5 pl-2.5 pr-3.5 text-xs text-zinc-200 transition hover:bg-white/10"
            >
              <span className="relative flex h-2 w-2" aria-hidden="true">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-400 opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-cyan-400" />
              </span>
              Free for up to 5 active jobs. No card.
            </a>

            <h1
              className="animate-fade-up text-[2rem] font-bold leading-[1.1] tracking-tight text-white sm:text-5xl sm:leading-[1.08] md:text-6xl md:leading-[1.05]"
              style={{ animationDelay: '60ms' }}
            >
              <span className="block">Run your service business</span>{' '}
              <span className="block bg-gradient-to-r from-cyan-200 to-cyan-400 bg-clip-text pb-1 text-transparent">
                without the chaos.
              </span>
            </h1>

            <p
              className="animate-fade-up mx-auto mt-6 max-w-2xl text-base leading-relaxed text-zinc-300 text-pretty md:text-lg"
              style={{ animationDelay: '120ms' }}
            >
              Jobs, quotes, invoices, and scheduling in one lightweight app built for crews in the field.
              It replaces the spreadsheet, the group text, and the pile of paper invoices.
            </p>

            <div
              className="animate-fade-up mt-9 flex flex-wrap justify-center gap-3"
              style={{ animationDelay: '180ms' }}
            >
              <Link
                href="/sign-up"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
              >
                Start free
                <ArrowRightIcon />
              </Link>
              <a
                href="#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                See how it works
              </a>
            </div>

            <p className="animate-fade-up mt-6 text-sm text-zinc-400" style={{ animationDelay: '240ms' }}>
              No card. No demo call. It runs on the phone you already have.
            </p>
          </div>

          <div
            className="animate-fade-up relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 md:pb-24 lg:px-8"
            style={{ animationDelay: '320ms' }}
          >
            <BoardPreview />
          </div>
        </section>

        {/* Numbers */}
        <section aria-label="FieldKit by the numbers" className="border-y border-zinc-800 bg-zinc-950/60">
          <dl className="mx-auto grid max-w-7xl grid-cols-2 gap-x-8 gap-y-8 px-4 py-10 sm:px-6 lg:grid-cols-4 lg:px-8">
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col-reverse justify-end">
                <dt className="mt-1.5 max-w-[16rem] text-sm leading-snug text-zinc-400">{stat.label}</dt>
                <dd className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">{stat.value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Features */}
          <section id="features" aria-labelledby="features-heading" className="pt-20 md:pt-28">
            <SectionHeading id="features-heading" eyebrow="What's in the kit" title="Everything you need. Nothing you don't.">
              FieldKit isn&apos;t a CRM and it isn&apos;t a project manager. It&apos;s the short list of things a
              service business needs to look professional and stay organized.
            </SectionHeading>
            <FeatureGrid />
          </section>

          {/* How it works */}
          <section id="how-it-works" aria-labelledby="how-heading" className="pt-20 md:pt-28">
            <SectionHeading id="how-heading" eyebrow="How it works" title="From first call to paid invoice">
              The app follows the way a job actually goes. Four steps, and you can stop pretending the whiteboard
              is a system.
            </SectionHeading>
            <HowItWorks />
          </section>

          {/* Pricing */}
          <section id="pricing" aria-labelledby="pricing-heading" className="pt-20 md:pt-28">
            <SectionHeading id="pricing-heading" eyebrow="Pricing" title="Simple, transparent pricing">
              Start free, scale as you grow. No hidden fees, no surprises.
            </SectionHeading>
            <PricingTable />
            <p className="mt-6 max-w-3xl text-sm leading-relaxed text-zinc-400">
              Every account starts on Free, with no card. Paid plans include a 14-day trial, and for now upgrades
              go through a person instead of a checkout page.{' '}
              <ContactButton className="inline min-h-0 font-medium text-zinc-100 underline underline-offset-4 hover:text-white">
                Talk to me
              </ContactButton>{' '}
              about a paid or custom plan. It goes straight to my inbox.
            </p>
          </section>

          {/* Closing CTA */}
          <section aria-labelledby="cta-heading" className="py-20 md:py-28">
            <div className="reveal relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 px-6 py-14 text-center sm:px-10 md:py-20">
              <div className="absolute inset-0 bg-blueprint-fine" aria-hidden="true" />
              <div
                className="absolute inset-0"
                aria-hidden="true"
                style={{
                  background:
                    'radial-gradient(ellipse 60% 80% at 50% 0%, rgba(34,211,238,0.14) 0%, transparent 70%)',
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" aria-hidden="true" />

              <div className="relative mx-auto max-w-2xl">
                <h2 id="cta-heading" className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                  Ready to get organized?
                </h2>
                <p className="mt-4 text-lg leading-relaxed text-zinc-300 text-pretty">
                  Add a job, send a quote, see if it sticks. It&apos;s free to find out.
                </p>
                <div className="mt-8 flex flex-wrap justify-center gap-3">
                  <Link
                    href="/sign-up"
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-zinc-200"
                  >
                    Start free
                    <ArrowRightIcon />
                  </Link>
                  <ContactButton className="inline-flex items-center justify-center rounded-lg border border-white/25 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                    Ask a question first
                  </ContactButton>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
