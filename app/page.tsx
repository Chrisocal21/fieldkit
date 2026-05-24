'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useJobStore } from '@/store/jobStore'
import { useClientStore } from '@/store/clientStore'
import { useInventoryStore } from '@/store/inventoryStore'
import { useTimeEntryStore } from '@/store/timeEntryStore'
import { useTeamStore } from '@/store/teamStore'
import { useInvoiceStore } from '@/store/invoiceStore'
import { useMaterialCostStore } from '@/store/materialCostStore'
import { useExpenseStore } from '@/store/expenseStore'
import { useDashboardStore, WIDGET_META, WidgetId } from '@/store/dashboardStore'
import StatusBadge from '@/components/shared/StatusBadge'
import SkeletonLoader from '@/components/shared/SkeletonLoader'

const calculateQuoteTotal = (quote: any) => {
  const regular = (quote.lineItems || []).filter((i: any) => i.type !== 'discount' && i.type !== 'deposit')
  const discountAmt = (quote.lineItems || []).filter((i: any) => i.type === 'discount').reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0)
  const depositAmt = (quote.lineItems || []).filter((i: any) => i.type === 'deposit').reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0)
  const subtotal = regular.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0)
  const taxable = Math.max(0, subtotal - discountAmt)
  const gross = taxable + taxable * (quote.taxRate || 0) + (quote.roundingAdjustment ?? 0)
  return gross - depositAmt
}

const WIDGET_ORDER: WidgetId[] = [
  'jobStatus', 'schedule', 'recentActivity', 'topClients',
  'lowStock', 'invoices', 'quotePipeline', 'team',
]

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const QUOTE_STATUS_COLORS: Record<string, string> = {
  Draft:    'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300',
  Sent:     'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400',
  Accepted: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400',
  Declined: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  Revised:  'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400',
}

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const { widgets, toggleWidget, resetWidgets } = useDashboardStore()

  const jobs = useJobStore((state) => state.jobs)
  const clients = useClientStore((state) => state.clients)
  const inventory = useInventoryStore((state) => state.items)
  const members = useTeamStore((state) => state.members)
  const { calculateJobLaborCost } = useTimeEntryStore()
  const invoices = useInvoiceStore((state) => state.invoices)
  const { getTotalOutstanding, markOverdueInvoices } = useInvoiceStore()
  const { calculateJobMaterialCost } = useMaterialCostStore()
  const { calculateJobExpenses } = useExpenseStore()

  const { activeJobs, draftJobs, quotedJobs, scheduledJobs, inProgressJobs, completedJobs } = useMemo(() => {
    const active = jobs.filter(j => !j.archived)
    return {
      activeJobs: active,
      draftJobs: active.filter(j => j.status === 'Draft'),
      quotedJobs: active.filter(j => j.status === 'Quoted'),
      scheduledJobs: active.filter(j => j.status === 'Scheduled'),
      inProgressJobs: active.filter(j => j.status === 'In Progress'),
      completedJobs: active.filter(j => j.status === 'Completed'),
    }
  }, [jobs])

  const { quotedRevenue, inProgressRevenue, completedRevenue } = useMemo(() => {
    const quoted = quotedJobs.reduce((sum, job) => {
      if (!job.quotes?.length) return sum
      return sum + calculateQuoteTotal(job.quotes[job.quotes.length - 1])
    }, 0)
    const inProgress = [...scheduledJobs, ...inProgressJobs].reduce((sum, job) => {
      if (!job.quotes?.length) return sum
      const q = job.quotes.find(q => q.status === 'Accepted') ?? job.quotes[job.quotes.length - 1]
      return sum + calculateQuoteTotal(q)
    }, 0)
    const completed = completedJobs.reduce((sum, job) => {
      if (!job.quotes?.length) return sum
      const q = job.quotes.find(q => q.status === 'Accepted') ?? job.quotes[job.quotes.length - 1]
      return sum + calculateQuoteTotal(q)
    }, 0)
    return { quotedRevenue: quoted, inProgressRevenue: inProgress, completedRevenue: completed }
  }, [quotedJobs, scheduledJobs, inProgressJobs, completedJobs])

  const { totalLaborCost, totalMaterialCost, totalExpenses } = useMemo(() => {
    const hourlyRatesMap = new Map(members.map(m => [m.id, m.hourlyRate]))
    const labor = completedJobs.reduce((sum, job) => sum + calculateJobLaborCost(job.id, hourlyRatesMap), 0)
    const materials = completedJobs.reduce((sum, job) => sum + calculateJobMaterialCost(job.id), 0)
    const expenses = completedJobs.reduce((sum, job) => sum + calculateJobExpenses(job.id), 0)
    return { totalLaborCost: labor, totalMaterialCost: materials, totalExpenses: expenses }
  }, [completedJobs, members, calculateJobLaborCost, calculateJobMaterialCost, calculateJobExpenses])

  const { netProfit } = useMemo(() => {
    const costs = totalLaborCost + totalMaterialCost + totalExpenses
    return { netProfit: completedRevenue - costs }
  }, [totalLaborCost, totalMaterialCost, totalExpenses, completedRevenue])

  const lowStockItems = useMemo(() =>
    inventory.filter(item => item.currentStock <= item.lowStockThreshold),
    [inventory]
  )

  const topClients = useMemo(() => {
    const clientRevenue = new Map<string, number>()
    completedJobs.forEach(job => {
      if (job.clientId && job.quotes?.length) {
        const q = job.quotes.find(q => q.status === 'Accepted') ?? job.quotes[job.quotes.length - 1]
        clientRevenue.set(job.clientId, (clientRevenue.get(job.clientId) || 0) + calculateQuoteTotal(q))
      }
    })
    return Array.from(clientRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([clientId, revenue]) => ({ client: clients.find(c => c.id === clientId), revenue }))
      .filter(item => item.client)
  }, [completedJobs, clients])

  const upcomingThisWeek = useMemo(() => {
    const now = Date.now()
    const weekEnd = now + 7 * 24 * 60 * 60 * 1000
    return activeJobs
      .filter(j => j.dueDate && j.dueDate >= now && j.dueDate <= weekEnd && j.status !== 'Completed' && j.status !== 'Cancelled')
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
      .slice(0, 6)
  }, [activeJobs])

  const calendarDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date()
      d.setDate(d.getDate() + i)
      d.setHours(0, 0, 0, 0)
      const dayEnd = new Date(d); dayEnd.setHours(23, 59, 59, 999)
      const count = activeJobs.filter(j =>
        j.dueDate && j.dueDate >= d.getTime() && j.dueDate <= dayEnd.getTime() &&
        j.status !== 'Completed' && j.status !== 'Cancelled'
      ).length
      return { date: d, count, isToday: i === 0 }
    })
  }, [activeJobs])

  const quotePipeline = useMemo(() => {
    const allQuotes = activeJobs.flatMap(j => j.quotes || [])
    const statuses = ['Draft', 'Sent', 'Accepted', 'Declined', 'Revised'] as const
    return statuses
      .map(status => ({
        status,
        count: allQuotes.filter(q => q.status === status).length,
        value: allQuotes.filter(q => q.status === status).reduce((s, q) => s + calculateQuoteTotal(q), 0),
      }))
      .filter(g => g.count > 0)
  }, [activeJobs])

  const teamWorkload = useMemo(() =>
    members
      .filter(m => m.active)
      .map(member => ({
        member,
        activeJobCount: activeJobs.filter(j =>
          j.assigneeId === member.id && j.status !== 'Completed' && j.status !== 'Cancelled'
        ).length,
      }))
      .sort((a, b) => b.activeJobCount - a.activeJobCount),
    [members, activeJobs]
  )

  useEffect(() => {
    setMounted(true)
    markOverdueInvoices()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (!mounted) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
        </div>
        <SkeletonLoader variant="stat" count={4} />
        <div className="mt-6"><SkeletonLoader variant="card" count={6} /></div>
      </div>
    )
  }

  const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const recentJobs = activeJobs
    .filter(j => j.updatedAt > sevenDaysAgo)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5)

  const STAT_CARDS: { label: string; value: number; sub: string; icon: string; accent?: 'rose' | 'emerald' }[] = [
    { label: 'Quoted',        value: quotedRevenue,        sub: `${quotedJobs.length} jobs`,                                    icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
    { label: 'In Progress',   value: inProgressRevenue,    sub: `${scheduledJobs.length + inProgressJobs.length} jobs`,         icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Completed',     value: completedRevenue,     sub: `${completedJobs.length} jobs`,                                  icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Labor Cost',    value: totalLaborCost,       sub: 'Completed jobs',                                                icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Material Cost', value: totalMaterialCost,    sub: 'Completed jobs',                                                icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4' },
    { label: 'Expenses',      value: totalExpenses,        sub: 'Completed jobs',                                                icon: 'M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z' },
    { label: 'Net Profit',    value: netProfit,            sub: `${completedRevenue > 0 ? ((netProfit / completedRevenue) * 100).toFixed(1) : '0'}% margin`, accent: netProfit >= 0 ? 'emerald' : 'rose', icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6' },
    { label: 'Outstanding',   value: getTotalOutstanding(), sub: 'Unpaid invoices', accent: 'rose',                             icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
  ]

  return (
    <>
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your business.
          </p>
        </div>
        <button
          onClick={() => setCustomizeOpen(true)}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="hidden sm:inline">Customize</span>
        </button>
      </div>

      {/* Revenue Cards — always visible */}
      <div className="mb-6">
        {/* Mobile: horizontal scroll */}
        <div className="lg:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3 pb-2 min-w-max">
            {STAT_CARDS.map(card => (
              <div key={card.label} className={`bg-white dark:bg-gray-800 border rounded-lg p-3 w-[140px] flex-shrink-0 ${
                card.accent === 'rose' ? 'border-rose-200 dark:border-rose-800/50' :
                card.accent === 'emerald' ? 'border-emerald-200 dark:border-emerald-800/50' :
                'border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
                  <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                  </svg>
                </div>
                <p className={`text-xl font-bold ${
                  card.accent === 'rose' ? 'text-rose-600 dark:text-rose-400' :
                  card.accent === 'emerald' && netProfit < 0 ? 'text-rose-600 dark:text-rose-400' :
                  card.accent === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                  'text-gray-900 dark:text-white'
                }`}>
                  {card.label === 'Net Profit' && netProfit < 0 ? '-' : ''}${Math.abs(card.value).toFixed(0)}
                </p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{card.sub}</p>
              </div>
            ))}
          </div>
        </div>
        {/* Desktop: grid */}
        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-4">
          {STAT_CARDS.map(card => (
            <div key={card.label} className={`bg-white dark:bg-gray-800 border rounded-lg p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors ${
              card.accent === 'rose' ? 'border-rose-200 dark:border-rose-800/50' :
              card.accent === 'emerald' ? 'border-emerald-200 dark:border-emerald-800/50' :
              'border-gray-200 dark:border-gray-700'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{card.label}</p>
                <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
              <p className={`text-2xl font-bold ${
                card.accent === 'rose' ? 'text-rose-600 dark:text-rose-400' :
                card.accent === 'emerald' && netProfit < 0 ? 'text-rose-600 dark:text-rose-400' :
                card.accent === 'emerald' ? 'text-emerald-600 dark:text-emerald-400' :
                'text-gray-900 dark:text-white'
              }`}>
                {card.label === 'Net Profit' && netProfit < 0 ? '-' : ''}${Math.abs(card.value).toFixed(0)}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{card.sub}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">

          {/* Job Status */}
          {widgets.jobStatus && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Job Status</h2>
                <button onClick={() => router.push('/jobs')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">View jobs</button>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: 'Draft',       count: draftJobs.length },
                  { label: 'Quoted',      count: quotedJobs.length },
                  { label: 'Scheduled',   count: scheduledJobs.length },
                  { label: 'In Progress', count: inProgressJobs.length },
                  { label: 'Completed',   count: completedJobs.length },
                ].map(s => (
                  <div
                    key={s.label}
                    onClick={() => router.push('/jobs')}
                    className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer transition-colors text-center"
                  >
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{s.count}</p>
                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {widgets.recentActivity && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                <button onClick={() => router.push('/jobs')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">View all</button>
              </div>
              {recentJobs.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No activity in the last 7 days</p>
              ) : (
                <div className="space-y-1">
                  {recentJobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => router.push('/jobs')}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{job.clientName}</p>
                      </div>
                      <StatusBadge status={job.status} className="ml-3 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quote Pipeline */}
          {widgets.quotePipeline && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Quote Pipeline</h2>
                <button onClick={() => router.push('/quotes')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">View all</button>
              </div>
              {quotePipeline.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No quotes yet</p>
              ) : (
                <div className="space-y-2">
                  {quotePipeline.map(({ status, count, value }) => {
                    const total = quotePipeline.reduce((s, g) => s + g.count, 0)
                    return (
                      <div key={status} className="flex items-center gap-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-20 justify-center flex-shrink-0 ${QUOTE_STATUS_COLORS[status]}`}>
                          {status}
                        </span>
                        <div className="flex-1 h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              status === 'Accepted' ? 'bg-emerald-500' :
                              status === 'Sent'     ? 'bg-blue-500' :
                              status === 'Declined' ? 'bg-red-400' :
                              status === 'Revised'  ? 'bg-amber-500' :
                              'bg-gray-400'
                            }`}
                            style={{ width: `${total ? (count / total) * 100 : 0}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400 w-6 text-right flex-shrink-0">{count}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right flex-shrink-0">${value.toFixed(0)}</span>
                      </div>
                    )
                  })}
                  <div className="pt-2 border-t border-gray-100 dark:border-gray-700 flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400">Open pipeline</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${quotePipeline.filter(g => g.status === 'Draft' || g.status === 'Sent').reduce((s, g) => s + g.value, 0).toFixed(0)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Outstanding Invoices */}
          {widgets.invoices && invoices.filter(inv => inv.status !== 'Paid').length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Outstanding Invoices</h2>
                <span className="text-xl font-bold text-gray-900 dark:text-white">${getTotalOutstanding().toFixed(0)}</span>
              </div>
              <div className="space-y-2">
                {invoices
                  .filter(inv => inv.status !== 'Paid')
                  .sort((a, b) => {
                    if (a.status === 'Overdue' && b.status !== 'Overdue') return -1
                    if (a.status !== 'Overdue' && b.status === 'Overdue') return 1
                    return (a.dueDate || 0) - (b.dueDate || 0)
                  })
                  .slice(0, 5)
                  .map((invoice) => {
                    const job = jobs.find(j => j.id === invoice.jobId)
                    const balance = invoice.amountDue - invoice.amountPaid
                    const isOverdue = invoice.status === 'Overdue'
                    return (
                      <div
                        key={invoice.id}
                        onClick={() => invoice.jobId ? router.push(`/jobs?id=${invoice.jobId}`) : router.push('/jobs')}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isOverdue
                            ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20'
                            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">INV-{invoice.invoiceNumber}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {job?.clientName || 'Unknown'} · Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <p className={`text-sm font-semibold ${isOverdue ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'}`}>
                            ${balance.toFixed(0)}
                          </p>
                          {isOverdue && <span className="text-xs font-medium text-red-600 dark:text-red-400">OVERDUE</span>}
                        </div>
                      </div>
                    )
                  })}
                {invoices.filter(inv => inv.status !== 'Paid').length > 5 && (
                  <button onClick={() => router.push('/jobs')} className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-center py-1">
                    +{invoices.filter(inv => inv.status !== 'Paid').length - 5} more
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4 lg:space-y-6">

          {/* Schedule with 7-day strip */}
          {widgets.schedule && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Schedule</h2>
                </div>
                <button onClick={() => router.push('/schedule')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">View all</button>
              </div>
              {/* 7-day strip */}
              <div className="grid grid-cols-7 gap-1 mb-4">
                {calendarDays.map(({ date, count, isToday }) => (
                  <button
                    key={date.toISOString()}
                    onClick={() => router.push('/schedule')}
                    className={`flex flex-col items-center py-2 rounded-lg transition-colors ${
                      isToday ? 'bg-blue-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    <span className={`text-[9px] font-medium mb-1 ${isToday ? 'text-blue-100' : 'text-gray-400 dark:text-gray-500'}`}>
                      {DAY_LABELS[date.getDay()]}
                    </span>
                    <span className={`text-sm font-bold leading-none ${isToday ? 'text-white' : 'text-gray-900 dark:text-white'}`}>
                      {date.getDate()}
                    </span>
                    <div className={`mt-1.5 w-1.5 h-1.5 rounded-full ${
                      count > 0 ? (isToday ? 'bg-blue-200' : 'bg-blue-500') : 'bg-transparent'
                    }`} />
                  </button>
                ))}
              </div>
              {/* Upcoming jobs */}
              {upcomingThisWeek.length === 0 ? (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">No jobs due this week</p>
              ) : (
                <div className="space-y-2">
                  {upcomingThisWeek.map(job => {
                    const daysUntil = Math.ceil(((job.dueDate ?? 0) - Date.now()) / (1000 * 60 * 60 * 24))
                    const dayLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : new Date(job.dueDate!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    return (
                      <div
                        key={job.id}
                        onClick={() => router.push('/jobs')}
                        className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{job.title}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{job.clientName}</p>
                        </div>
                        <div className="text-right ml-2 flex-shrink-0">
                          <p className={`text-xs font-semibold ${
                            daysUntil === 0 ? 'text-rose-600 dark:text-rose-400' :
                            daysUntil === 1 ? 'text-amber-600 dark:text-amber-400' :
                            'text-blue-600 dark:text-blue-400'
                          }`}>{dayLabel}</p>
                          <StatusBadge status={job.status} className="mt-0.5" />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Top Clients */}
          {widgets.topClients && topClients.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Clients</h2>
                <button onClick={() => router.push('/clients')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">View all</button>
              </div>
              <div className="space-y-2">
                {topClients.map(({ client, revenue }) => (
                  <div
                    key={client!.id}
                    onClick={() => router.push('/clients')}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{client!.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{client!.email || client!.phone || 'No contact info'}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white ml-3 flex-shrink-0">${revenue.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Team Overview */}
          {widgets.team && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team</h2>
                <button onClick={() => router.push('/team')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">Manage</button>
              </div>
              {teamWorkload.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-500 dark:text-gray-400">No active team members</p>
                  <button onClick={() => router.push('/team')} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">Add a member</button>
                </div>
              ) : (
                <div className="space-y-1">
                  {teamWorkload.map(({ member, activeJobCount }) => (
                    <div key={member.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{member.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.role || 'Team member'}</p>
                      </div>
                      {activeJobCount > 0 ? (
                        <span className="text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 px-2 py-0.5 rounded-full font-medium flex-shrink-0">
                          {activeJobCount} job{activeJobCount !== 1 ? 's' : ''}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">Free</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Low Stock Alerts */}
          {widgets.lowStock && lowStockItems.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock</h2>
                <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                  {lowStockItems.length}
                </span>
              </div>
              <div className="space-y-2">
                {lowStockItems.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    onClick={() => router.push('/inventory')}
                    className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/10 hover:bg-orange-100 dark:hover:bg-orange-900/20 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.currentStock} {item.unit} left</p>
                    </div>
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 ml-2 flex-shrink-0">LOW</span>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <button onClick={() => router.push('/inventory')} className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-center py-1">
                    +{lowStockItems.length - 5} more
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>

    {/* Customize Panel */}
    {customizeOpen && (
      <>
        <div
          className="fixed inset-0 bg-black/30 dark:bg-black/50 z-40"
          onClick={() => setCustomizeOpen(false)}
        />
        <div className="fixed right-0 top-0 bottom-0 w-80 bg-white dark:bg-gray-900 z-50 shadow-2xl flex flex-col">
          <div className="flex items-center justify-between px-4 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold text-gray-900 dark:text-white">Customize Dashboard</h2>
            <button
              onClick={() => setCustomizeOpen(false)}
              className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 dark:text-gray-400 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-1">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 px-1">
              Toggle the sections you want visible on your dashboard.
            </p>
            {WIDGET_ORDER.map(id => (
              <div
                key={id}
                className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{WIDGET_META[id].label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{WIDGET_META[id].description}</p>
                </div>
                <button
                  onClick={() => toggleWidget(id)}
                  className={`relative inline-flex h-5 w-14 items-center rounded-full transition-colors flex-shrink-0 mt-0.5 focus:outline-none ${
                    widgets[id] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={widgets[id]}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                    widgets[id] ? 'translate-x-9' : 'translate-x-0.5'
                  }`} />
                </button>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={resetWidgets}
              className="w-full text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              Reset to defaults
            </button>
          </div>
        </div>
      </>
    )}
    </>
  )
}