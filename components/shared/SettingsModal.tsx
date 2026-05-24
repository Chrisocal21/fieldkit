'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSettingsStore, Theme, NotificationSettings } from '@/store/settingsStore'
import { useBrandingStore } from '@/store/brandingStore'
import QRCodeGeneratorModal from './QRCodeGeneratorModal'
import ShortURLGeneratorModal from './ShortURLGeneratorModal'
import BusinessCardGeneratorModal from './BusinessCardGeneratorModal'

type SettingsTab = 'appearance' | 'profile' | 'documents' | 'notifications' | 'tools' | 'data' | 'about'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<SettingsTab>('appearance')

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
  const [showBusinessCard, setShowBusinessCard] = useState(false)

  if (!isOpen) return null

  const inputCls =
    'w-full px-3 py-2.5 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all'

  const TAB_NAV: { id: SettingsTab; label: string; icon: React.ReactNode }[] = [
    { id: 'appearance',    label: 'Appearance',    icon: <AppearanceIcon /> },
    { id: 'profile',       label: 'Business',      icon: <BuildingIcon /> },
    { id: 'documents',     label: 'Documents',     icon: <DocIcon /> },
    { id: 'notifications', label: 'Notifications', icon: <BellIcon /> },
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
            <div className="w-40 flex-shrink-0 border-r border-gray-200 dark:border-gray-800 flex flex-col py-3 gap-0.5 px-2">
              {TAB_NAV.map(({ id, label, icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    activeTab === id
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-200'
                  }`}
                >
                  <span className="flex-shrink-0 w-4 h-4">{icon}</span>
                  {label}
                </button>
              ))}

              {/* About — separated at bottom */}
              <div className="mt-auto pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={() => setActiveTab('about')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors ${
                    activeTab === 'about'
                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                      : 'text-gray-500 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <span className="flex-shrink-0 w-4 h-4"><InfoIcon /></span>
                  About
                </button>
              </div>
            </div>

            {/* Right content area */}
            <div className="flex-1 overflow-y-auto p-6 min-w-0">

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
                          className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                            theme === value
                              ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                              : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                          }`}
                        >
                          {icon}
                          {label}
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
                      label="Business Card"
                      description="Design and export a digital card"
                      icon={<CardIcon />}
                      onClick={() => setShowBusinessCard(true)}
                    />
                    <ToolRow
                      label="Branding Studio"
                      description="Logos, colors, typography & assets"
                      icon={<BrushIcon />}
                      onClick={() => { onClose(); router.push('/branding') }}
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
                    <button
                      onClick={() => {
                        const exportData: Record<string, unknown> = { exportedAt: new Date().toISOString(), version: '1.0.0' }
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
                    <AboutRow label="Version" value="1.0.0" />
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
      <BusinessCardGeneratorModal isOpen={showBusinessCard} onClose={() => setShowBusinessCard(false)} />
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
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none ${
        enabled ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ${
          enabled ? 'translate-x-5' : 'translate-x-0'
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