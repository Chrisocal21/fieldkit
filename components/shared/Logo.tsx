interface LogoMarkProps {
  className?: string
}

/**
 * The FK monogram on its tile. Same geometry as public/logo.svg and the app
 * icons, inlined so it stays crisp and needs no theme-specific invert.
 */
export function LogoMark({ className = 'h-8 w-8' }: LogoMarkProps) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={`shrink-0 ${className}`}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <rect width="32" height="32" rx="7" fill="#09090b" />
      <rect x="0.5" y="0.5" width="31" height="31" rx="6.5" stroke="#27272a" />
      <g strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7.5 25V7H15M7.5 16H13" stroke="#fafafa" />
        <path d="M19 7V25M26 7L19 16L26 25" stroke="#22d3ee" />
      </g>
    </svg>
  )
}

interface LogoProps {
  className?: string
  markClassName?: string
  wordmarkClassName?: string
}

/** Monogram plus the FIELDKIT wordmark. */
export default function Logo({
  className = '',
  markClassName = 'h-8 w-8',
  wordmarkClassName = 'text-lg',
}: LogoProps) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <LogoMark className={markClassName} />
      <span className={`font-display font-bold tracking-[0.04em] leading-none ${wordmarkClassName}`}>
        FIELDKIT
      </span>
    </span>
  )
}
