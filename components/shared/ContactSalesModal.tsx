'use client'

import { useEffect, useState } from 'react'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { PLANS } from '@/lib/plans'

interface ContactSalesModalProps {
  isOpen: boolean
  onClose: () => void
  selectedPlan?: string
}

const paidPlans = PLANS.filter((plan) => plan.price > 0)

const inputClass =
  'w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-950 px-3 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500'
const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5'

export default function ContactSalesModal({ isOpen, onClose, selectedPlan }: ContactSalesModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    plan: selectedPlan || '',
    phone: '',
    message: '',
  })
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Pick up the plan the user clicked each time the modal opens
  useEffect(() => {
    if (isOpen && selectedPlan) {
      setFormData((prev) => ({ ...prev, plan: selectedPlan }))
    }
  }, [isOpen, selectedPlan])

  useEffect(() => {
    if (!isOpen) return
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [isOpen, onClose])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('sending')
    setErrorMessage('')

    // The inbox takes a single message body, so the plan, company, and phone
    // ride along at the bottom of it instead of getting dropped.
    const details = [
      formData.plan && `Plan: ${formData.plan}`,
      formData.company && `Company: ${formData.company}`,
      formData.phone && `Phone: ${formData.phone}`,
    ].filter(Boolean)
    const message = details.length
      ? `${formData.message}\n\n---\n${details.join('\n')}`
      : formData.message

    try {
      const response = await fetch('https://mail.probablyfinestudios.com/api/public/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Origin: window.location.origin,
        },
        body: JSON.stringify({
          source_site: 'fieldkit',
          name: formData.name,
          email: formData.email,
          message,
          company: '',
        }),
      })

      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        throw new Error(payload?.error ?? 'Failed to send message')
      }

      setStatus('success')
      setTimeout(() => {
        onClose()
        setFormData({ name: '', email: '', company: '', plan: selectedPlan || '', phone: '', message: '' })
        setStatus('idle')
      }, 2000)
    } catch (error) {
      setStatus('error')
      setErrorMessage("That didn't send. Give it a minute and try again.")
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm text-left"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="contact-title"
        className="relative w-full max-w-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl shadow-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-start justify-between gap-4 p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 rounded-t-2xl">
          <div>
            <h2 id="contact-title" className="text-xl font-bold text-gray-900 dark:text-white">Get in touch</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Tell me what you need. It goes straight to my inbox, and I&apos;ll get back to you within 24 hours.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex items-center justify-center p-2 -m-2 rounded-lg text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className={labelClass}>Name</label>
              <input
                type="text"
                id="name"
                name="name"
                required
                autoComplete="name"
                value={formData.name}
                onChange={handleChange}
                className={inputClass}
                placeholder="John Smith"
              />
            </div>
            <div>
              <label htmlFor="email" className={labelClass}>Email</label>
              <input
                type="email"
                id="email"
                name="email"
                required
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="john@company.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="company" className={labelClass}>
                Company <span className="font-normal text-gray-400 dark:text-gray-500">(optional)</span>
              </label>
              <input
                type="text"
                id="company"
                name="company"
                autoComplete="organization"
                value={formData.company}
                onChange={handleChange}
                className={inputClass}
                placeholder="Acme Plumbing"
              />
              <input
                type="text"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="absolute left-[-9999px] opacity-0"
                aria-hidden="true"
              />
            </div>
            <div>
              <label htmlFor="phone" className={labelClass}>
                Phone <span className="font-normal text-gray-400 dark:text-gray-500">(optional)</span>
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                className={inputClass}
                placeholder="+1 (555) 123-4567"
              />
            </div>
          </div>

          <div>
            <label htmlFor="plan" className={labelClass}>Plan you&apos;re interested in</label>
            <select
              id="plan"
              name="plan"
              value={formData.plan}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">Not sure yet</option>
              {paidPlans.map((plan) => (
                <option key={plan.tier} value={plan.name}>
                  {plan.name} - ${plan.price}/month
                </option>
              ))}
              <option value="Custom">Something custom</option>
            </select>
          </div>

          <div>
            <label htmlFor="message" className={labelClass}>Message</label>
            <textarea
              id="message"
              name="message"
              required
              rows={4}
              value={formData.message}
              onChange={handleChange}
              className={`${inputClass} resize-none`}
              placeholder="How big is the crew, and which part of the job is a mess right now?"
            />
          </div>

          {/* Status Messages */}
          <div role="status" aria-live="polite">
            {status === 'success' && (
              <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-sm text-green-800 dark:text-green-200">
                  Sent. I&apos;ll get back to you within 24 hours.
                </p>
              </div>
            )}

            {status === 'error' && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-sm text-red-800 dark:text-red-200">{errorMessage}</p>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400">No auto-replies. A person reads this.</p>
            <div className="flex items-center gap-2 ml-auto">
              <button
                type="button"
                onClick={onClose}
                className="inline-flex items-center justify-center px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={status === 'sending' || status === 'success'}
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-700 dark:hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {status === 'sending' ? 'Sending...' : 'Send it'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
