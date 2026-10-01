import type { Metadata, Viewport } from 'next'
import { SignIn } from '@clerk/nextjs'
import AuthShell from '@/components/marketing/AuthShell'
import { authAppearance } from '@/lib/clerkAppearance'

export const metadata: Metadata = { title: 'Sign in' }
export const viewport: Viewport = { themeColor: '#000000' }

export default function SignInPage() {
  return (
    <AuthShell title="Welcome back." subtitle="Your jobs are right where you left them.">
      <SignIn appearance={authAppearance} />
    </AuthShell>
  )
}
