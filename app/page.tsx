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

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const todayLabel = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const pipelineValue = quotedRevenue + inProgressRevenue
  const unpaidInvoices = invoices.filter(inv => inv.status !== 'Paid')

  return (
    <>
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{greeting}</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{todayLabel}</p>
        </div>
        <button
          onClick={() => setCustomizeOpen(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors flex-shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
          </svg>
          <span className="hidden sm:inline">Customize</span>
        </button>
      </div>

      {/* Hero: 3 key numbers */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div
          onClick={() => router.push('/jobs')}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
        >
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Active Jobs</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{activeJobs.length}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{inProgressJobs.length} in progress</p>
        </div>
        <div
          onClick={() => router.push('/quotes')}
          className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 cursor-pointer hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
        >
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Pipeline</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">${pipelineValue.toLocaleString('en-US', { maximumFractionDigits: 0 })}</p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">{quotedJobs.length + scheduledJobs.length + inProgressJobs.length} jobs</p>
        </div>
        <div
          onClick={() => router.push('/jobs')}
          className={`bg-white dark:bg-gray-800 rounded-xl p-4 cursor-pointer transition-colors ${
            getTotalOutstanding() > 0
              ? 'border border-rose-200 dark:border-rose-800/50 hover:border-rose-400 dark:hover:border-rose-600'
              : 'border border-gray-200 dark:border-gray-700 hover:border-slate-400 dark:hover:border-slate-500'
          }`}
        >
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Outstanding</p>
          <p className={`text-3xl font-bold ${getTotalOutstanding() > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
            ${getTotalOutstanding().toLocaleString('en-US', { maximumFractionDigits: 0 })}
          </p>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1.5">
            {unpaidInvoices.length} invoice{unpaidInvoices.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Left column */}
        <div className="lg:col-span-2 space-y-4">

          {/* Job Status */}
          {widgets.jobStatus && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">Jobs</h2>
                <button onClick={() => router.push('/jobs')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">View all</button>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {[
                  { label: 'Draft',       count: draftJobs.length,      color: 'text-gray-500 dark:text-gray-400' },
                  { label: 'Quoted',      count: quotedJobs.length,     color: 'text-amber-600 dark:text-amber-400' },
                  { label: 'Scheduled',   count: scheduledJobs.length,  color: 'text-blue-600 dark:text-blue-400' },
                  { label: 'In Progress', count: inProgressJobs.length, color: 'text-violet-600 dark:text-violet-400' },
                  { label: 'Completed',   count: completedJobs.length,  color: 'text-emerald-600 dark:text-emerald-400' },
                ].map(s => (
                  <button
                    key={s.label}
                    onClick={() => router.push('/jobs')}
                    className="flex flex-col items-center py-3 bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <p className={`text-xl font-bold ${s.color}`}>{s.count}</p>
                    <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 mt-0.5 text-center leading-tight">{s.label}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {widgets.recentActivity && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
                <button onClick={() => router.push('/jobs')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">View all</button>
              </div>
              {recentJobs.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-6">No activity in the last 7 days</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {recentJobs.map(job => (
                    <div
                      key={job.id}
                      onClick={() => router.push('/jobs')}
                      className="flex items-center justify-between py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 -mx-1 px-1 rounded-lg cursor-pointer transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{job.clientName}</p>
                      </div>
                      <StatusBadge status={job.status} className="ml-3 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Quote Pipeline */}
          {widgets.quotePipeline && quotePipeline.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">Quote Pipeline</h2>
                <button onClick={() => router.push('/quotes')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">View all</button>
              </div>
              <div className="space-y-2">
                {quotePipeline.map(({ status, count, value }) => {
                  const total = quotePipeline.reduce((s, g) => s + g.count, 0)
                  return (
                    <div key={status} className="flex items-center gap-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium w-20 justify-center flex-shrink-0 ${QUOTE_STATUS_COLORS[status]}`}>
                        {status}
                      </span>
                      <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
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
                      <span className="text-xs text-gray-400 dark:text-gray-500 w-5 text-right flex-shrink-0">{count}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white w-20 text-right flex-shrink-0">${value.toFixed(0)}</span>
                    </div>
                  )
                })}
                <div className="pt-2 border-t border-gray-100 dark:border-gray-700/50 flex justify-between text-sm">
                  <span className="text-gray-400 dark:text-gray-500">Open pipeline</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ${quotePipeline.filter(g => g.status === 'Draft' || g.status === 'Sent').reduce((s, g) => s + g.value, 0).toFixed(0)}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Outstanding Invoices */}
          {widgets.invoices && unpaidInvoices.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">Outstanding Invoices</h2>
                <span className="text-lg font-bold text-gray-900 dark:text-white">${getTotalOutstanding().toFixed(0)}</span>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {unpaidInvoices
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
                        className={`flex items-center justify-between py-2.5 -mx-1 px-1 rounded-lg cursor-pointer transition-colors ${
                          isOverdue
                            ? 'hover:bg-rose-50 dark:hover:bg-rose-900/10'
                            : 'hover:bg-gray-50 dark:hover:bg-gray-700/30'
                        }`}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">INV-{invoice.invoiceNumber}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                            {job?.clientName || 'Unknown'} · {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'No due date'}
                          </p>
                        </div>
                        <div className="text-right ml-3 flex-shrink-0">
                          <p className={`text-sm font-semibold ${isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-gray-900 dark:text-white'}`}>
                            ${balance.toFixed(0)}
                          </p>
                          {isOverdue && <p className="text-[10px] font-medium text-rose-500 uppercase tracking-wide">Overdue</p>}
                        </div>
                      </div>
                    )
                  })}
                {unpaidInvoices.length > 5 && (
                  <button onClick={() => router.push('/jobs')} className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-center pt-2">
                    +{unpaidInvoices.length - 5} more
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Top Clients */}
          {widgets.topClients && topClients.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">Top Clients</h2>
                <button onClick={() => router.push('/clients')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">View all</button>
              </div>
              <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {topClients.map(({ client, revenue }) => (
                  <div
                    key={client!.id}
                    onClick={() => router.push('/clients')}
                    className="flex items-center justify-between py-2.5 -mx-1 px-1 hover:bg-gray-50 dark:hover:bg-gray-700/30 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{client!.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{client!.email || client!.phone || 'No contact info'}</p>
                    </div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-white ml-3 flex-shrink-0">${revenue.toFixed(0)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="space-y-4">

          {/* Schedule with 7-day strip */}
          {widgets.schedule && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-blue-200 dark:border-blue-800/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h2 className="font-semibold text-gray-900 dark:text-white">Schedule</h2>
                </div>
                <button onClick={() => router.push('/schedule')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">View all</button>
              </div>
              {/* 7-day strip */}
              <div className="grid grid-cols-7 gap-1 mb-3">
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
                <p className="text-sm text-gray-400 dark:text-gray-500 text-center py-4">No jobs due this week</p>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-blue-900/20">
                  {upcomingThisWeek.map(job => {
                    const daysUntil = Math.ceil(((job.dueDate ?? 0) - Date.now()) / (1000 * 60 * 60 * 24))
                    const dayLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : new Date(job.dueDate!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                    return (
                      <div
                        key={job.id}
                        onClick={() => router.push('/jobs')}
                        className="flex items-center justify-between py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/10 -mx-1 px-1 rounded-lg cursor-pointer transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{job.clientName}</p>
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

          {/* Team Overview */}
          {widgets.team && (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white">Team</h2>
                <button onClick={() => router.push('/team')} className="text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">Manage</button>
              </div>
              {teamWorkload.length === 0 ? (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 dark:text-gray-500">No active team members</p>
                  <button onClick={() => router.push('/team')} className="mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">Add a member</button>
                </div>
              ) : (
                <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {teamWorkload.map(({ member, activeJobCount }) => (
                    <div key={member.id} className="flex items-center gap-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/30 -mx-1 px-1 rounded-lg transition-colors">
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-sm font-semibold text-slate-600 dark:text-slate-300 flex-shrink-0">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{member.role || 'Team member'}</p>
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
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-orange-200 dark:border-orange-800/50 p-4">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-4 h-4 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <h2 className="font-semibold text-gray-900 dark:text-white">Low Stock</h2>
                <span className="ml-auto text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 px-2 py-0.5 rounded-full font-medium">
                  {lowStockItems.length}
                </span>
              </div>
              <div className="divide-y divide-orange-100 dark:divide-orange-900/20">
                {lowStockItems.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    onClick={() => router.push('/inventory')}
                    className="flex items-center justify-between py-2.5 hover:bg-orange-50 dark:hover:bg-orange-900/10 -mx-1 px-1 rounded-lg cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{item.name}</p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">{item.currentStock} {item.unit} left</p>
                    </div>
                    <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 ml-2 flex-shrink-0">LOW</span>
                  </div>
                ))}
                {lowStockItems.length > 5 && (
                  <button onClick={() => router.push('/inventory')} className="w-full text-sm text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-center pt-2">
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
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 dark:text-white text-sm">{WIDGET_META[id].label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{WIDGET_META[id].description}</p>
                </div>
                <button
                  onClick={() => toggleWidget(id)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors flex-shrink-0 shrink-0 p-0 focus:outline-none ${
                    widgets[id] ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  role="switch"
                  aria-checked={widgets[id]}
                >
                  <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    widgets[id] ? 'translate-x-5' : 'translate-x-0.5'
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