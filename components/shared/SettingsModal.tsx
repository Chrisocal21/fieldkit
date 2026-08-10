'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSettingsStore, Theme, NotificationSettings } from '@/store/settingsStore'
import { useBrandingStore } from '@/store/brandingStore'
import { useSubscriptionStore, PLAN_LIMITS } from '@/store/subscriptionStore'
import { syncWithCloud } from '@/lib/sync'
import QRCodeGeneratorModal from './QRCodeGeneratorModal'
import ShortURLGeneratorModal from './ShortURLGeneratorModal'
import PromoCodeModal from './PromoCodeModal'

type SettingsTab = 'appearance' | 'profile' | 'documents' | 'notifications' | 'subscription' | 'tools' | 'data' | 'about'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  initialTab?: SettingsTab
}

export default function SettingsModal({ isOpen, onClose, initialTab = 'appearance' }: SettingsModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>(initialTab)
  const [syncState, setSyncState] = useState<'idle' | 'syncing' | 'done' | 'error'>('idle')
  const [syncResult, setSyncResult] = useState<Record<string, number>>({})
  const [promoModalOpen, setPromoModalOpen] = useState(false)
  const [syncError, setSyncError] = useState<string | undefined>(undefined)

  // Appearance
  const theme = useSettingsStore((s) => s.theme)
  const setTheme = useSettingsStore((s) => s.setTheme)

  // Document defaults
  const defaultTaxRate = useSettingsStore((s) => s.defaultTaxRate)
  const setDefaultTaxRate = useSettingsStore((s) => s.setDefaultTaxRate)
  const defaultPaymentTerms = useSettingsStore((s) => s.defaultPaymentTerms)
  const setDefaultPaymentTerms = useSettingsStore((s) => s.setDefaultPaymentTerms)
  const defaultQuoteExpiry = useSettingsStore((s) => s.defaultQuoteExpiry)
  const setDefaultQuoteExpiry = useSettingsStore((s) => s.setDefaultQuoteExpiry)
  const invoicePrefix = useSettingsStore((s) => s.invoicePrefix)
  const setInvoicePrefix = useSettingsStore((s) => s.setInvoicePrefix)
  const quotePrefix = useSettingsStore((s) => s.quotePrefix)
  const setQuotePrefix = useSettingsStore((s) => s.setQuotePrefix)
  const currency = useSettingsStore((s) => s.currency)
  const setCurrency = useSettingsStore((s) => s.setCurrency)

  // Notifications
  const notifications = useSettingsStore((s) => s.notifications)
  const setNotification = useSettingsStore((s) => s.setNotification)

  // Business profile — backed by brandingStore default preset
  const { getDefaultPreset, updatePreset } = useBrandingStore()
  const preset = getDefaultPreset()

  const [bizName, setBizName] = useState(preset.businessName || '')
  const [bizTagline, setBizTagline] = useState(preset.footerText || '')
  const [bizEmail, setBizEmail] = useState(preset.businessEmail || '')
  const [bizPhone, setBizPhone] = useState(preset.businessPhone || '')
  const [bizWebsite, setBizWebsite] = useState(preset.businessWebsite || '')
  const [bizAddress, setBizAddress] = useState(preset.businessAddress || '')

  const saveProfile = () => {
    updatePreset(preset.id, {
      businessName: bizName,
      footerText: bizTagline,
      businessEmail: bizEmail,
      businessPhone: bizPhone,
      businessWebsite: bizWebsite,
      businessAddress: bizAddress,
    })
  }

  // Tools
  const [showQRCode, setShowQRCode] = useState(false)
  const [showShortURL, setShowShortURL] = useState(false)

  if (!isOpen) return null

  const inputCls =
    'w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all'

  const TAB_NAV: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance',    label: 'Appearance',    icon: <AppearanceIcon /> },
    { id: 'profile',       label: 'Business',      icon: <BuildingIcon /> },
    { id: 'documents',     label: 'Documents',     icon: <DocIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon /> },
    { id: 'subscription',  label: 'Plan',          icon: <CreditCardIcon /> },
    { id: 'tools',         label: 'Tools',         icon: <ToolsIcon /> },
    { id: 'data',          label: 'Data',          icon: <DataIcon /> },
  ]

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">

          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 flex-shrink-0">
            <div className="flex items-center gap-2.5">
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <h2 className="text-base font-semibold text-gray-900 dark:text-white">Settings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Body: left nav + right content */}
          <div className="flex flex-1 overflow-hidden min-h-0">

            {/* Left sidebar nav */}
            <div className="w-10 sm:w-40 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col py-3 gap-0.5 px-1 sm:px-2">
              {TAB_NAV.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center justify-center sm:justify-start gap-2.5 px-0 sm:px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    activeTab === id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="flex-shrink-0 w-4 h-4">{icon}</span>
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}

              {/* About — separated at bottom */}
              <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab('about')}
                className={`w-full flex items-center justify-center sm:justify-start gap-2.5 px-0 sm:px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    activeTab === 'about'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="flex-shrink-0 w-4 h-4"><InfoIcon /></span>
                  <span className="hidden sm:inline">About</span>
                </button>
              </div>
            </div>

            {/* Right content area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 min-w-0">

              {/* ── APPEARANCE ── */}
              {activeTab === 'appearance' && (
                <div className="space-y-6">
                  <TabHeading>Appearance</TabHeading>
                  <FieldGroup label="Theme">
                    <div className="flex p-1 bg-gray-100 dark:bg-gray-800 rounded-lg gap-1">
                      {([
                        { value: 'light'  as Theme, label: 'Light',  icon: <SunIcon /> },
                        { value: 'dark'   as Theme, label: 'Dark',   icon: <MoonIcon /> },
                        { value: 'system' as Theme, label: 'System', icon: <MonitorIcon /> },
                      ]).map(({ value, label, icon }) => (
                        <button
                          key={value}
                          onClick={() => setTheme(value)}
                          className={`flex-1 flex items-center justify-center gap-1 py-2 px-1 sm:px-3 rounded-md text-xs sm:text-sm font-medium transition-all ${
                            theme === value
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                          }`}
                        >
                          {icon}
                          <span className="hidden sm:inline">{label}</span>
                        </button>
                      ))}
                    </div>
                  </FieldGroup>
                </div>
              )}

              {/* ── BUSINESS PROFILE ── */}
              {activeTab === 'profile' && (
                <div className="space-y-3">
                  <TabHeading>Business Profile</TabHeading>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Used on all quotes, invoices, and documents.</p>
                  <input type="text" value={bizName} onChange={(e) => setBizName(e.target.value)} onBlur={saveProfile} placeholder="Business name" className={inputCls} />
                  <input type="text" value={bizTagline} onChange={(e) => setBizTagline(e.target.value)} onBlur={saveProfile} placeholder="Tagline or slogan" className={inputCls} />
                  <div className="grid grid-cols-2 gap-3">
                    <input type="email" value={bizEmail} onChange={(e) => setBizEmail(e.target.value)} onBlur={saveProfile} placeholder="Business email" className={inputCls} />
                    <input type="tel" value={bizPhone} onChange={(e) => setBizPhone(e.target.value)} onBlur={saveProfile} placeholder="Phone number" className={inputCls} />
                  </div>
                  <input type="url" value={bizWebsite} onChange={(e) => setBizWebsite(e.target.value)} onBlur={saveProfile} placeholder="Website URL" className={inputCls} />
                  <textarea value={bizAddress} onChange={(e) => setBizAddress(e.target.value)} onBlur={saveProfile} placeholder="Business address" rows={3} className={`${inputCls} resize-none`} />
                  <p className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1.5 pt-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Saved automatically
                  </p>
                </div>
              )}

              {/* ── DOCUMENTS ── */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  <TabHeading>Document Defaults</TabHeading>

                  <FieldGroup label="Currency">
                    <select value={currency} onChange={(e) => setCurrency(e.target.value)} className={inputCls}>
                      {['USD', 'CAD', 'EUR', 'GBP', 'AUD', 'NZD', 'JPY', 'MXN', 'CHF'].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </FieldGroup>

                  <FieldGroup label="Default Tax Rate">
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        min={0} max={100} step={0.1}
                        value={(defaultTaxRate * 100).toFixed(1)}
                        onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) / 100 || 0)}
                        className={`${inputCls} w-28`}
                      />
                      <span className="text-sm text-gray-500 dark:text-gray-400">%</span>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Applied by default to new quotes and invoices.</p>
                  </FieldGroup>

                  <FieldGroup label="Quote Expiry (Days)">
                    <input
                      type="number"
                      min={1} max={365}
                      value={defaultQuoteExpiry}
                      onChange={(e) => setDefaultQuoteExpiry(parseInt(e.target.value) || 30)}
                      className={`${inputCls} w-28`}
                    />
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">Default days until a new quote expires.</p>
                  </FieldGroup>

                  <FieldGroup label="Invoice Payment Terms">
                    <div className="flex gap-2 flex-wrap">
                      {[7, 14, 30, 60, 90].map((days) => (
                        <button
                          key={days}
                          onClick={() => setDefaultPaymentTerms(days)}
                          className={`px-4 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                            defaultPaymentTerms === days
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-blue-400 hover:text-blue-600'
                          }`}
                        >
                          Net {days}
                        </button>
                      ))}
                    </div>
                  </FieldGroup>

                  <FieldGroup label="Document Numbering Prefixes">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Quote prefix</label>
                        <input type="text" value={quotePrefix} onChange={(e) => setQuotePrefix(e.target.value)} placeholder="QUO-" className={inputCls} />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 block">Invoice prefix</label>
                        <input type="text" value={invoicePrefix} onChange={(e) => setInvoicePrefix(e.target.value)} placeholder="INV-" className={inputCls} />
                      </div>
                    </div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">e.g. QUO-0042, INV-0019</p>
                  </FieldGroup>
                </div>
              )}

              {/* ── NOTIFICATIONS ── */}
              {activeTab === 'notifications' && (
                <div className="space-y-5">
                  <TabHeading>Notifications</TabHeading>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Control which activity sends you alerts.</p>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {([
                      { key: 'jobUpdates',    label: 'Job Updates',      desc: 'Status changes, new assignments' },
                      { key: 'quoteActivity', label: 'Quote Activity',   desc: 'Views, acceptances, declines' },
                      { key: 'teamActivity',  label: 'Team Activity',    desc: 'Clock-ins and time log entries' },
                      { key: 'lowStock',      label: 'Low Stock Alerts', desc: 'Inventory below minimum threshold' },
                    ] as { key: keyof NotificationSettings; label: string; desc: string }[]).map(({ key, label, desc }) => (
                      <div key={key} className="flex items-center justify-between px-4 py-3.5 bg-white dark:bg-gray-900">
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{label}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{desc}</p>
                        </div>
                        <Toggle enabled={notifications[key]} onChange={(val) => setNotification(key, val)} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── SUBSCRIPTION & PLAN ── */}
              {activeTab === 'subscription' && (() => {
                const { currentPlan, trialEndsAt, isTrialActive } = useSubscriptionStore.getState()
                const limits = PLAN_LIMITS[currentPlan]
                const planName = currentPlan.charAt(0).toUpperCase() + currentPlan.slice(1)
                
                let trialDaysLeft = 0
                if (isTrialActive && trialEndsAt) {
                  trialDaysLeft = Math.ceil((trialEndsAt - Date.now()) / (1000 * 60 * 60 * 24))
                }

                const planPrices: Record<typeof currentPlan, string> = {
                  free: '$0',
                  starter: '$29',
                  professional: '$79',
                  enterprise: '$199',
                }

                const planColors: Record<typeof currentPlan, string> = {
                  free: 'gray',
                  starter: 'blue',
                  professional: 'violet',
                  enterprise: 'amber',
                }

                return (
                  <div className="space-y-5">
                    <TabHeading>Subscription & Plan</TabHeading>
                    
                    {/* Current Plan Card */}
                    <div className={`border-2 rounded-xl p-5 bg-gradient-to-br ${
                      currentPlan === 'free' 
                        ? 'border-gray-200 dark:border-gray-700 from-gray-50 to-white dark:from-gray-800 dark:to-gray-900'
                        : currentPlan === 'starter'
                        ? 'border-blue-200 dark:border-blue-800 from-blue-50 to-white dark:from-blue-900/20 dark:to-gray-900'
                        : currentPlan === 'professional'
                        ? 'border-violet-200 dark:border-violet-800 from-violet-50 to-white dark:from-violet-900/20 dark:to-gray-900'
                        : 'border-amber-200 dark:border-amber-800 from-amber-50 to-white dark:from-amber-900/20 dark:to-gray-900'
                    }`}>
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">{planName} Plan</h3>
                            {isTrialActive && (
                              <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full">
                                Trial
                              </span>
                            )}
                          </div>
                          <p className="text-2xl font-bold text-gray-900 dark:text-white">
                            {planPrices[currentPlan]}<span className="text-sm font-normal text-gray-500">/month</span>
                          </p>
                        </div>
                        {currentPlan === 'free' && (
                          <button
                            onClick={() => setPromoModalOpen(true)}
                            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-sm font-medium rounded-lg transition-all"
                          >
                            🎟️ Promo Code
                          </button>
                        )}
                        {currentPlan !== 'enterprise' && currentPlan !== 'free' && (
                          <Link
                            href="/sign-up"
                            onClick={onClose}
                            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
                          >
                            Upgrade
                          </Link>
                        )}
                      </div>

                      {isTrialActive && trialEndsAt && (
                        <div className="mb-4 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-200 dark:border-gray-700">
                          <p className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-semibold">{trialDaysLeft} {trialDaysLeft === 1 ? 'day' : 'days'} left</span> in your trial
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            Add payment before {new Date(trialEndsAt).toLocaleDateString()} to continue
                          </p>
                        </div>
                      )}

                      {/* Plan Limits */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Your Plan Includes</p>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Active Jobs</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {limits.maxJobs === null ? 'Unlimited' : limits.maxJobs}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Clients</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {limits.maxClients === null ? 'Unlimited' : limits.maxClients}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Team Members</span>
                            <span className="font-medium text-gray-900 dark:text-white">
                              {limits.maxTeamMembers === null ? 'Unlimited' : limits.maxTeamMembers || 'Not available'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Invoices</span>
                            <span className={`font-medium ${limits.hasInvoices ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                              {limits.hasInvoices ? '✓ Enabled' : '✗ Locked'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Inventory</span>
                            <span className={`font-medium ${limits.hasInventory ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                              {limits.hasInventory ? '✓ Enabled' : '✗ Locked'}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600 dark:text-gray-400">Time Tracking</span>
                            <span className={`font-medium ${limits.hasTimeTracking ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-400'}`}>
                              {limits.hasTimeTracking ? '✓ Enabled' : '✗ Locked'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Other Plans */}
                    {currentPlan !== 'enterprise' && (
                      <div className="space-y-3">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">Available Plans</p>
                        {(['starter', 'professional', 'enterprise'] as const).filter(p => p !== currentPlan).map((plan) => {
                          const planLimits = PLAN_LIMITS[plan]
                          const name = plan.charAt(0).toUpperCase() + plan.slice(1)
                          return (
                            <div key={plan} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-blue-500 dark:hover:border-blue-500 transition-colors">
                              <div className="flex items-center justify-between mb-2">
                                <div>
                                  <h4 className="font-semibold text-gray-900 dark:text-white">{name}</h4>
                                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                                    {planPrices[plan]}<span className="text-sm font-normal text-gray-500">/month</span>
                                  </p>
                                </div>
                                <Link
                                  href="/sign-up"
                                  onClick={onClose}
                                  className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-lg transition-colors"
                                >
                                  Select
                                </Link>
                              </div>
                              <ul className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                                {planLimits.maxJobs === null && <li>• Unlimited jobs</li>}
                                {planLimits.maxTeamMembers !== null && planLimits.maxTeamMembers > 0 && <li>• Up to {planLimits.maxTeamMembers} team members</li>}
                                {planLimits.maxTeamMembers === null && <li>• Unlimited team members</li>}
                                {planLimits.hasInvoices && <li>• Invoices & payments</li>}
                                {planLimits.hasInventory && <li>• Inventory management</li>}
                                {planLimits.hasAdvancedReporting && <li>• Advanced reporting</li>}
                                {planLimits.hasCustomBranding && <li>• Custom branding</li>}
                                {planLimits.hasApiAccess && <li>• API access</li>}
                              </ul>
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {currentPlan === 'enterprise' && (
                      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                        <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                          You're on the Enterprise plan with full access to all features.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })()}

              {/* ── TOOLS ── */}
              {activeTab === 'tools' && (
                <div className="space-y-5">
                  <TabHeading>Tools</TabHeading>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    <ToolRow
                      label="QR Code Generator"
                      description="Create a scannable code for any URL"
                      icon={<QRIcon />}
                      onClick={() => setShowQRCode(true)}
                    />
                    <ToolRow
                      label="Short URL"
                      description="Shorten and share long links"
                      icon={<LinkIcon />}
                      onClick={() => setShowShortURL(true)}
                    />

                    <ToolRow
                      label="Branding Studio"
                      description="Logos, colors, typography & assets"
                      icon={<BrushIcon />}
                      onClick={() => { onClose(); router.push('/branding') }}
                    />

                    <ToolRow
                      label="Notepad"
                      description="Folders and notes, synced across devices"
                      icon={<NotepadIcon />}
                      onClick={() => { onClose(); router.push('/notes') }}
                    />
                  </div>
                </div>
              )}

              {/* ── DATA & PRIVACY ── */}
              {activeTab === 'data' && (
                <div className="space-y-5">
                  <TabHeading>Data & Privacy</TabHeading>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Manage your local app data and preferences.</p>
                  <div className="divide-y divide-gray-100 dark:divide-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {/* Sync to Cloud */}
                    <button
                      onClick={async () => {
                        setSyncState('syncing')
                        setSyncResult({})
                        setSyncError(undefined)
                        const result = await syncWithCloud()
                        setSyncState(result.ok ? 'done' : 'error')
                        setSyncResult(result.pushed)
                        setSyncError(result.reason)
                        setTimeout(() => setSyncState('idle'), 4000)
                      }}
                      disabled={syncState === 'syncing'}
                      className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group disabled:opacity-60"
                    >
                      <span className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg ${
                        syncState === 'done' ? 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' :
                        syncState === 'error' ? 'bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400' :
                        'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      }`}>
                        {syncState === 'syncing' ? (
                          <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                          </svg>
                        ) : syncState === 'done' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                        )}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">
                          {syncState === 'syncing' ? 'Syncing…' : syncState === 'done' ? 'Sync complete' : syncState === 'error' ? 'Sync failed' : 'Sync to Cloud'}
                        </span>
                        <span className="block text-xs text-gray-400 mt-0.5">
                          {syncState === 'done' && Object.keys(syncResult).length > 0
                            ? `Pushed: ${Object.entries(syncResult).map(([k, v]) => `${v} ${k}`).join(', ')}`
                            : syncState === 'done'
                            ? 'Everything is up to date'
                            : syncState === 'error'
                            ? (syncError ?? 'Could not reach cloud — check your connection')
                            : 'Pulls the latest from the cloud and uploads any local changes (this also happens automatically in the background)'
                          }
                        </span>
                      </span>
                      {syncState === 'idle' && <ChevronIcon />}
                    </button>
                    <button
                      onClick={() => {
                        const exportData: Record<string, unknown> = { exportedAt: new Date().toISOString(), version: process.env.NEXT_PUBLIC_APP_VERSION ?? '?' }
                        for (let i = 0; i < localStorage.length; i++) {
                          const key = localStorage.key(i)
                          if (key && key.startsWith('fieldkit')) {
                            try { exportData[key] = JSON.parse(localStorage.getItem(key) || '') }
                            catch { exportData[key] = localStorage.getItem(key) }
                          }
                        }
                        const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `fieldkit-export-${new Date().toISOString().slice(0, 10)}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
                    >
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                        <ExportIcon />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-gray-900 dark:text-white">Export Data</span>
                        <span className="block text-xs text-gray-400 mt-0.5">Download all FieldKit data as JSON</span>
                      </span>
                      <ChevronIcon />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Clear all local cached data? The app will reload. Synced cloud data is safe.')) {
                          const keys: string[] = []
                          for (let i = 0; i < localStorage.length; i++) {
                            const k = localStorage.key(i)
                            if (k && k.startsWith('fieldkit')) keys.push(k)
                          }
                          keys.forEach((k) => localStorage.removeItem(k))
                          window.location.reload()
                        }
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3.5 bg-white dark:bg-gray-900 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-left group"
                    >
                      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-400">
                        <TrashIcon />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium text-red-600 dark:text-red-400">Clear Local Data</span>
                        <span className="block text-xs text-gray-400 mt-0.5">Removes local cache — cloud data is preserved</span>
                      </span>
                      <ChevronIcon />
                    </button>
                  </div>
                </div>
              )}

              {/* ── ABOUT ── */}
              {activeTab === 'about' && (
                <div className="space-y-6">
                  <TabHeading>About FieldKit</TabHeading>
                  <div className="flex flex-col items-center py-6 text-center gap-3">
                    <div className="w-16 h-16 rounded-2xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-600/30">
                      <span className="text-white font-bold text-xl tracking-tight">FK</span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white tracking-wide">FIELDKIT</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Field service management, simplified.</p>
                    </div>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-800 rounded-lg overflow-hidden divide-y divide-gray-100 dark:divide-gray-700">
                    <AboutRow label="Version" value={process.env.NEXT_PUBLIC_APP_VERSION ?? '?'} />
                    <AboutRow label="Platform" value="Web / PWA" />
                    <AboutRow label="Stack" value="Next.js · Cloudflare" />
                    <AboutRow label="Year" value="2026" last />
                  </div>
                  <p className="text-xs text-center text-gray-400 dark:text-gray-500">
                    Built for tradespeople &amp; field service teams.
                  </p>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>

      {/* Tool sub-modals */}
      <QRCodeGeneratorModal isOpen={showQRCode} onClose={() => setShowQRCode(false)} />
      <ShortURLGeneratorModal isOpen={showShortURL} onClose={() => setShowShortURL(false)} />
      <PromoCodeModal isOpen={promoModalOpen} onClose={() => setPromoModalOpen(false)} />
    </>
  )
}

// ── Layout helpers ──────────────────────────────────────────────────────────

function TabHeading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-gray-900 dark:text-white">{children}</h3>
}

function FieldGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${
        enabled ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
      }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ease-in-out ${
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

function ToolRow({ label, description, icon, onClick }: { label: string; description: string; icon: React.ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left group"
    >
      <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-gray-900 dark:text-white">{label}</span>
        <span className="block text-xs text-gray-400 dark:text-gray-500 mt-0.5">{description}</span>
      </span>
      <ChevronIcon />
    </button>
  )
}

function AboutRow({ label, value, last }: { label: string; value: string; last?: boolean }) {
  return (
    <div className={`flex justify-between items-center px-4 py-2.5 text-sm ${!last ? 'border-b border-gray-100 dark:border-gray-700' : ''}`}>
      <span className="text-gray-500 dark:text-gray-400">{label}</span>
      <span className="font-medium text-gray-900 dark:text-white">{value}</span>
    </div>
  )
}

// ── Icons ───────────────────────────────────────────────────────────────────

function AppearanceIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  )
}

function DocIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  )
}

function CreditCardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )
}

function ToolsIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  )
}

function DataIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
    </svg>
  )
}

function InfoIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function SunIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707M17.657 17.657l-.707-.707M6.343 6.343l-.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
    </svg>
  )
}

function MonitorIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  )
}

function QRIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
    </svg>
  )
}

function CardIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
    </svg>
  )
}

function BrushIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  )
}

function NotepadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
    </svg>
  )
}

function ExportIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg className="w-4 h-4 text-gray-300 dark:text-gray-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}