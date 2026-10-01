import Link from 'next/link'
import Logo from '@/components/shared/Logo'
import { ArrowUpRightIcon } from './icons'

const STUDIO_URL = 'https://probablyfinestudios.com'

export default function SiteFooter() {
  const year = new Date().getFullYear()

  return (
    <footer className="border-t border-zinc-800 bg-black text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 md:grid-cols-[1.6fr_1fr_1fr_1.2fr]">
          <div className="col-span-2 md:col-span-1">
            <Logo markClassName="h-7 w-7" wordmarkClassName="text-base" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-zinc-400">
              Lightweight operations for service businesses. Jobs, quotes, invoices, and scheduling in one place.
            </p>
          </div>

          <div>
            <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Product</h2>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              <li><a href="#features" className="hover:text-white transition">Features</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition">How it works</a></li>
              <li><a href="#pricing" className="hover:text-white transition">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Account</h2>
            <ul className="space-y-2.5 text-sm text-zinc-300">
              <li><Link href="/sign-in" className="hover:text-white transition">Sign in</Link></li>
              <li><Link href="/sign-up" className="hover:text-white transition">Create an account</Link></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-1">
            <h2 className="mb-4 font-sans text-xs font-semibold uppercase tracking-[0.2em] text-zinc-400">Who built this</h2>
            <p className="mb-4 text-sm leading-relaxed text-zinc-400">
              One developer, at a studio named after its quality-assurance process.
            </p>
            <a
              href={STUDIO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-white hover:underline"
            >
              Probably Fine Studios
              <ArrowUpRightIcon />
              <span className="sr-only">(opens in a new tab)</span>
            </a>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-zinc-800 pt-6 text-xs text-zinc-400 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {year} FieldKit. Built for service professionals.</p>
          <p>Built with Next.js, Cloudflare, and stubbornness. Tested by me, so: probably fine.</p>
        </div>
      </div>
    </footer>
  )
}
