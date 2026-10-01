import type { Metadata, Viewport } from 'next'
import { SignUp } from '@clerk/nextjs'
import AuthShell from '@/components/marketing/AuthShell'
import { authAppearance } from '@/lib/clerkAppearance'

export const metadata: Metadata = { title: 'Create your account' }
export const viewport: Viewport = { themeColor: '#000000' }

export default function SignUpPage() {
  return (
    <AuthShell
      title="Start free."
      subtitle="Add a job, send a quote, see if it sticks. It takes an email address and no credit card."
    >
      <SignUp appearance={authAppearance} />
    </AuthShell>
  )
}
