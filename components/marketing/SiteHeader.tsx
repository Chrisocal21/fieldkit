import Link from 'next/link'
import Logo from '@/components/shared/Logo'
import MobileMenu from './MobileMenu'

const links = [
  { href: '#features', label: 'Features' },
  { href: '#how-it-works', label: 'How it works' },
  { href: '#pricing', label: 'Pricing' },
]

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-zinc-800/80 bg-black/80 backdrop-blur-md">
      <nav
        aria-label="Main"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4"
      >
        <Link href="/" className="flex items-center shrink-0 rounded-lg text-white">
          <Logo markClassName="h-8 w-8" wordmarkClassName="text-base sm:text-lg" />
          <span className="sr-only">home page</span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          <ul className="hidden md:flex items-center gap-1 mr-2">
            {links.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex items-center px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
          <Link
            href="/sign-in"
            className="hidden sm:inline-flex items-center px-3 py-2 rounded-lg text-sm text-zinc-300 hover:text-white hover:bg-white/5 transition"
          >
            Sign in
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center bg-white text-black px-4 py-2 rounded-lg hover:bg-zinc-200 transition text-sm font-semibold whitespace-nowrap"
          >
            Start free
          </Link>
          <MobileMenu links={links} />
        </div>
      </nav>
    </header>
  )
}
