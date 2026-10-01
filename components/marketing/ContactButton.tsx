'use client'

import { useState } from 'react'
import ContactSalesModal from '@/components/shared/ContactSalesModal'

interface ContactButtonProps {
  children: React.ReactNode
  className?: string
  /** Pre-selects a plan in the form */
  plan?: string
}

/** Opens the contact form. Messages go to the same inbox as the in-app form. */
export default function ContactButton({ children, className, plan }: ContactButtonProps) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        {children}
      </button>
      <ContactSalesModal isOpen={open} onClose={() => setOpen(false)} selectedPlan={plan} />
    </>
  )
}
