'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

interface MobileMenuProps {
  links: { href: string; label: string }[]
}

export default function MobileMenu({ links }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    const onPointerDown = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('pointerdown', onPointerDown)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('pointerdown', onPointerDown)
    }
  }, [open])

  return (
    <div ref={ref} className="md:hidden relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="site-menu"
        aria-label="Menu"
        className="flex items-center justify-center w-10 h-10 -mr-2 text-zinc-300 rounded-lg hover:bg-white/5 transition"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 7h16M4 12h16M4 17h16'}
          />
        </svg>
      </button>
      {open && (
        <ul
          id="site-menu"
          className="absolute right-0 top-full mt-3 w-56 rounded-xl border border-zinc-800 bg-zinc-950 p-2 shadow-2xl"
        >
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                onClick={() => setOpen(false)}
                className="flex items-center px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white transition"
              >
                {link.label}
              </a>
            </li>
          ))}
          <li className="mt-2 pt-2 border-t border-zinc-800">
            <Link
              href="/sign-in"
              className="flex items-center px-3 py-2.5 rounded-lg text-zinc-300 hover:bg-white/5 hover:text-white transition"
            >
              Sign in
            </Link>
          </li>
        </ul>
      )}
    </div>
  )
}
