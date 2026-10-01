import { Inter, JetBrains_Mono, Sora } from 'next/font/google'

// Body copy and UI
export const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

// Display headings (h1, h2, and anything marked font-display)
export const sora = Sora({
  subsets: ['latin'],
  variable: '--font-sora',
  display: 'swap',
})

// Job numbers, money columns, and anything that should line up.
// Used in small doses, so it loads on demand instead of being preloaded.
export const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
})

export const fontVariables = `${inter.variable} ${sora.variable} ${jetbrainsMono.variable}`
