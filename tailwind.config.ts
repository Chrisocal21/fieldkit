import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import defaultTheme from 'tailwindcss/defaultTheme'

// Neutrals are zinc, driven by CSS variables in app/globals.css so the dark
// end of the scale can sit on true black in dark mode. Every existing
// `gray-*` class picks this up without touching the markup.
const neutral = (shade: number) => `rgb(var(--gray-${shade}) / <alpha-value>)`

// The FieldKit accent. Cyan, stepped one shade darker from 500 down so that
// white text on 500/600 keeps the contrast the old blue had (3.7:1 / 5.4:1).
// To change the brand color, change this scale and nothing else.
const brand = {
  50: '#ecfeff',
  100: '#cffafe',
  200: '#a5f3fc',
  300: '#67e8f9',
  400: '#22d3ee',
  500: '#0891b2',
  600: '#0e7490',
  700: '#155e75',
  800: '#164e63',
  900: '#123f52',
  950: '#083344',
}

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        gray: {
          50: neutral(50),
          100: neutral(100),
          200: neutral(200),
          300: neutral(300),
          400: neutral(400),
          500: neutral(500),
          600: neutral(600),
          700: neutral(700),
          800: neutral(800),
          900: neutral(900),
          950: neutral(950),
        },
        // Branding Studio is an always-dark surface built on slate; keep it
        // on the same neutral family, but fixed rather than theme-aware.
        slate: colors.zinc,
        brand,
        // Legacy alias: the app's primary color was `blue-*` everywhere.
        blue: brand,
        // Status colors as per spec
        status: {
          quoted: '#71717a',
          scheduled: brand[500],
          inProgress: '#F59E0B',
          completed: '#10B981',
          cancelled: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['var(--font-inter)', ...defaultTheme.fontFamily.sans],
        display: ['var(--font-sora)', 'var(--font-inter)', ...defaultTheme.fontFamily.sans],
        mono: ['var(--font-jetbrains)', ...defaultTheme.fontFamily.mono],
      },
      keyframes: {
        'fade-up': {
          from: { opacity: '0', transform: 'translateY(12px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in': 'fade-in 0.8s ease-out both',
      },
    },
  },
  plugins: [],
}

export default config
