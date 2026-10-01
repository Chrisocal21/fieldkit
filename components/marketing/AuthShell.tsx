import Link from 'next/link'
import Logo from '@/components/shared/Logo'
import { CheckIcon } from './icons'

interface AuthShellProps {
  title: string
  subtitle: string
  children: React.ReactNode
}

const points = [
  'Jobs, quotes, invoices, and scheduling in one place',
  'Free for up to 5 active jobs, no card',
  'Runs on the phone you already have',
]

/** Shared frame for the sign-in and sign-up pages. */
export default function AuthShell({ title, subtitle, children }: AuthShellProps) {
  return (
    <div data-surface="marketing" className="dark grid min-h-screen bg-black text-white antialiased lg:grid-cols-2">
      {/* Brand panel */}
      <div className="relative hidden overflow-hidden border-r border-zinc-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="absolute inset-0 bg-blueprint" aria-hidden="true" />
        <div
          className="absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              'radial-gradient(ellipse 80% 55% at 30% 40%, rgba(34,211,238,0.13) 0%, transparent 70%)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" aria-hidden="true" />

        <Link href="/" className="relative self-start rounded-lg">
          <Logo />
          <span className="sr-only">home page</span>
        </Link>

        <div className="relative max-w-md">
          <h1 className="text-4xl font-bold tracking-tight text-white xl:text-5xl">{title}</h1>
          <p className="mt-4 text-lg leading-relaxed text-zinc-300">{subtitle}</p>
          <ul className="mt-8 space-y-3 text-sm text-zinc-300">
            {points.map((point) => (
              <li key={point} className="flex items-start gap-3">
                <CheckIcon className="mt-0.5 h-4 w-4 shrink-0 text-cyan-400" />
                {point}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-zinc-500">
          Built by one developer at{' '}
          <a
            href="https://probablyfinestudios.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-300 underline underline-offset-4 hover:text-white"
          >
            Probably Fine Studios
          </a>
          .
        </p>
      </div>

      {/* Form */}
      <div className="flex flex-col items-center justify-center px-4 py-10 sm:px-6">
        <Link href="/" className="mb-8 rounded-lg lg:hidden">
          <Logo />
          <span className="sr-only">home page</span>
        </Link>
        <div className="flex w-full max-w-[26rem] justify-center">{children}</div>
      </div>
    </div>
  )
}
