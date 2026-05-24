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
import StatusBadge from '@/components/shared/StatusBadge'
import SkeletonLoader from '@/components/shared/SkeletonLoader'
import CollapsibleSection from '@/components/shared/CollapsibleSection'
import CreateJobModal from '@/components/jobs/CreateJobModal'

// Helper function to calculate quote total (mirrors QuotePreview logic)
const calculateQuoteTotal = (quote: any) => {
  const regular = (quote.lineItems || []).filter((i: any) => i.type !== 'discount' && i.type !== 'deposit')
  const discountAmt = (quote.lineItems || []).filter((i: any) => i.type === 'discount').reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0)
  const depositAmt = (quote.lineItems || []).filter((i: any) => i.type === 'deposit').reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0)
  const subtotal = regular.reduce((s: number, i: any) => s + i.quantity * i.unitPrice, 0)
  const taxable = Math.max(0, subtotal - discountAmt)
  const gross = taxable + taxable * (quote.taxRate || 0) + (quote.roundingAdjustment ?? 0)
  return gross - depositAmt
}

export default function DashboardPage() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [isCreateJobOpen, setIsCreateJobOpen] = useState(false)
  
  const jobs = useJobStore((state) => state.jobs)
  const clients = useClientStore((state) => state.clients)
  const inventory = useInventoryStore((state) => state.items)
  const timeEntries = useTimeEntryStore((state) => state.entries)
  const members = useTeamStore((state) => state.members)
  const { calculateJobLaborCost, calculateJobTotalHours } = useTimeEntryStore()
  const invoices = useInvoiceStore((state) => state.invoices)
  const { getTotalOutstanding, getOverdueInvoices, markOverdueInvoices } = useInvoiceStore()
  const { calculateJobMaterialCost } = useMaterialCostStore()
  const { calculateJobExpenses } = useExpenseStore()

  // Calculate revenue metrics - memoized for performance
  const { activeJobs, draftJobs, quotedJobs, scheduledJobs, inProgressJobs, completedJobs } = useMemo(() => {
    const active = jobs.filter(j => !j.archived)
    return {
      activeJobs: active,
      draftJobs: active.filter(j => j.status === 'Draft'),
      quotedJobs: active.filter(j => j.status === 'Quoted'),
      scheduledJobs: active.filter(j => j.status === 'Scheduled'),
      inProgressJobs: active.filter(j => j.status === 'In Progress'),
      completedJobs: active.filter(j => j.status === 'Completed')
    }
  }, [jobs])

  // Revenue calculations - memoized
  const { quotedRevenue, inProgressRevenue, completedRevenue } = useMemo(() => {
    const quoted = quotedJobs.reduce((sum, job) => {
      if (!job.quotes || job.quotes.length === 0) return sum
      const latestQuote = job.quotes[job.quotes.length - 1]
      return sum + calculateQuoteTotal(latestQuote)
    }, 0)

    const inProgress = [...scheduledJobs, ...inProgressJobs].reduce((sum, job) => {
      if (!job.quotes || job.quotes.length === 0) return sum
      const acceptedQuote = job.quotes.find(q => q.status === 'Accepted')
      const quoteToUse = acceptedQuote || job.quotes[job.quotes.length - 1]
      return sum + calculateQuoteTotal(quoteToUse)
    }, 0)

    const completed = completedJobs.reduce((sum, job) => {
      if (!job.quotes || job.quotes.length === 0) return sum
      const acceptedQuote = job.quotes.find(q => q.status === 'Accepted')
      const quoteToUse = acceptedQuote || job.quotes[job.quotes.length - 1]
      return sum + calculateQuoteTotal(quoteToUse)
    }, 0)

    return { quotedRevenue: quoted, inProgressRevenue: inProgress, completedRevenue: completed }
  }, [quotedJobs, scheduledJobs, inProgressJobs, completedJobs])

  // Cost calculations - memoized
  const { totalLaborCost, totalMaterialCost, totalExpenses } = useMemo(() => {
    const hourlyRatesMap = new Map(members.map(m => [m.id, m.hourlyRate]))
    
    const labor = completedJobs.reduce((sum, job) => {
      return sum + calculateJobLaborCost(job.id, hourlyRatesMap)
    }, 0)

    const materials = completedJobs.reduce((sum, job) => {
      return sum + calculateJobMaterialCost(job.id)
    }, 0)

    const expenses = completedJobs.reduce((sum, job) => {
      return sum + calculateJobExpenses(job.id)
    }, 0)

    return { totalLaborCost: labor, totalMaterialCost: materials, totalExpenses: expenses }
  }, [completedJobs, members, calculateJobLaborCost, calculateJobMaterialCost, calculateJobExpenses])

  // Net profit calculation - memoized
  const { totalJobCosts, netProfit } = useMemo(() => {
    const costs = totalLaborCost + totalMaterialCost + totalExpenses
    return {
      totalJobCosts: costs,
      netProfit: completedRevenue - costs
    }
  }, [totalLaborCost, totalMaterialCost, totalExpenses, completedRevenue])

  // Low stock inventory items - memoized
  const lowStockItems = useMemo(() => {
    return inventory.filter(item => item.currentStock <= item.lowStockThreshold)
  }, [inventory])

  // Top clients by revenue - memoized
  const topClients = useMemo(() => {
    const clientRevenue = new Map<string, number>()
    completedJobs.forEach(job => {
      if (job.clientId && job.quotes && job.quotes.length > 0) {
        const acceptedQuote = job.quotes.find(q => q.status === 'Accepted')
        const quoteToUse = acceptedQuote || job.quotes[job.quotes.length - 1]
        const revenue = calculateQuoteTotal(quoteToUse)
        clientRevenue.set(job.clientId, (clientRevenue.get(job.clientId) || 0) + revenue)
      }
    })
    return Array.from(clientRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([clientId, revenue]) => ({
        client: clients.find(c => c.id === clientId),
        revenue
      }))
      .filter(item => item.client)
  }, [completedJobs, clients])

  useEffect(() => {
    setMounted(true)
    markOverdueInvoices()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Upcoming jobs this week (next 7 days, non-terminal status)
  const upcomingThisWeek = useMemo(() => {
    const now = Date.now()
    const weekEnd = now + 7 * 24 * 60 * 60 * 1000
    return activeJobs
      .filter(j =>
        j.dueDate &&
        j.dueDate >= now &&
        j.dueDate <= weekEnd &&
        j.status !== 'Completed' &&
        j.status !== 'Cancelled'
      )
      .sort((a, b) => (a.dueDate || 0) - (b.dueDate || 0))
      .slice(0, 6)
  }, [activeJobs])

  if (!mounted) {
    return (
      <div className="p-4 lg:p-6 max-w-7xl mx-auto">
        <div className="mb-6">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2 animate-pulse" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-96 animate-pulse" />
        </div>
        <SkeletonLoader variant="stat" count={4} />
        <div className="mt-6">
          <SkeletonLoader variant="card" count={6} />
        </div>
      </div>
    )
  }

  // Recent activity (last 7 days)
  const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000)
  const recentJobs = activeJobs
    .filter(j => j.updatedAt > sevenDaysAgo)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 5)

  return (
    <>
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          Welcome back! Here's what's happening with your business.
        </p>
      </div>

      {/* Revenue Cards */}
      <div className="mb-6">
        {/* Mobile: Horizontal Scroll */}
        <div className="lg:hidden overflow-x-auto -mx-4 px-4 scrollbar-hide">
          <div className="flex gap-3 pb-2 min-w-max">
            {/* Quoted Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-[140px] flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Quoted</p>
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">${quotedRevenue.toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{quotedJobs.length} jobs</p>
            </div>

            {/* In Progress Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-[140px] flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">In Progress</p>
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">${inProgressRevenue.toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{scheduledJobs.length + inProgressJobs.length} jobs</p>
            </div>

            {/* Completed Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-[140px] flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">${completedRevenue.toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">{completedJobs.length} jobs</p>
            </div>

            {/* Labor Cost Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-[140px] flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Labor</p>
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">${totalLaborCost.toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Cost</p>
            </div>

            {/* Material Cost Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-[140px] flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Materials</p>
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">${totalMaterialCost.toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Cost</p>
            </div>

            {/* Expenses Card */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 w-[140px] flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Expenses</p>
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">${totalExpenses.toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Cost</p>
            </div>

            {/* Outstanding Card */}
            <div className="bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-800/50 rounded-lg p-3 w-[140px] flex-shrink-0">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xl font-bold text-rose-600 dark:text-rose-400">${getTotalOutstanding().toFixed(0)}</p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">Unpaid</p>
            </div>

            {/* Net Profit Card */}
            <div className={`border rounded-lg p-3 w-[140px] flex-shrink-0 ${
              netProfit >= 0 
                ? 'bg-white dark:bg-gray-800 border-emerald-200 dark:border-emerald-800/50' 
                : 'bg-white dark:bg-gray-800 border-rose-200 dark:border-rose-800/50'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
                <svg className="w-4 h-4 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <p className={`text-xl font-bold ${
                netProfit >= 0 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-rose-600 dark:text-rose-400'
              }`}>
                ${netProfit >= 0 ? '' : '-'}${Math.abs(netProfit).toFixed(0)}
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5">
                {completedRevenue > 0 ? ((netProfit / completedRevenue) * 100).toFixed(1) : '0'}% margin
              </p>
            </div>
          </div>
        </div>

        {/* Desktop: Grid */}
        <div className="hidden lg:grid grid-cols-2 xl:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Quoted</p>
              <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">${quotedRevenue.toFixed(0)}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{quotedJobs.length} jobs</p>
          </div>

          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">In Progress</p>
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${inProgressRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{scheduledJobs.length + inProgressJobs.length} jobs</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${completedRevenue.toFixed(0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{completedJobs.length} jobs</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Labor Cost</p>
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalLaborCost.toFixed(0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed jobs</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Material Cost</p>
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalMaterialCost.toFixed(0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed jobs</p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Expenses</p>
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">${totalExpenses.toFixed(0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed jobs</p>
        </div>

        <div className={`bg-white dark:bg-gray-800 border rounded-lg p-4 hover:border-slate-400 dark:hover:border-slate-600 transition-colors ${
          netProfit >= 0 
            ? 'border-emerald-200 dark:border-emerald-800/50' 
            : 'border-rose-200 dark:border-rose-800/50'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Net Profit</p>
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <p className={`text-2xl font-bold ${
            netProfit >= 0 
              ? 'text-emerald-600 dark:text-emerald-400' 
              : 'text-rose-600 dark:text-rose-400'
          }`}>
            ${netProfit >= 0 ? '' : '-'}${Math.abs(netProfit).toFixed(0)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {completedRevenue > 0 ? ((netProfit / completedRevenue) * 100).toFixed(1) : '0'}% margin
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 border border-rose-200 dark:border-rose-800/50 rounded-lg p-4 hover:border-rose-400 dark:hover:border-rose-600 transition-colors">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Outstanding</p>
            <svg className="w-5 h-5 text-gray-400 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-2xl font-bold text-rose-600 dark:text-rose-400">${getTotalOutstanding().toFixed(0)}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Unpaid invoices</p>
        </div>
      </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Column - Status Breakdown & Top Clients */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          {/* Job Status Breakdown */}
          <div className="lg:hidden">
            <CollapsibleSection
              title="Job Status"
              badge={activeJobs.length}
              summary={`${completedJobs.length} completed • ${inProgressJobs.length} in progress`}
              icon={
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              }
            >
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Draft', count: draftJobs.length },
                  { label: 'Quoted', count: quotedJobs.length },
                  { label: 'Scheduled', count: scheduledJobs.length },
                  { label: 'In Progress', count: inProgressJobs.length },
                  { label: 'Completed', count: completedJobs.length },
                ].map(status => (
                  <div
                    key={status.label}
                    className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer transition-colors"
                    onClick={() => router.push('/jobs')}
                  >
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{status.count}</p>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{status.label}</p>
                  </div>
                ))}
              </div>
            </CollapsibleSection>
          </div>

          {/* Desktop Job Status - Always Expanded */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Job Status</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {[
                { label: 'Draft', count: draftJobs.length },
                { label: 'Quoted', count: quotedJobs.length },
                { label: 'Scheduled', count: scheduledJobs.length },
                { label: 'In Progress', count: inProgressJobs.length },
                { label: 'Completed', count: completedJobs.length },
              ].map(status => (
                <div
                  key={status.label}
                  className="bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg p-3 cursor-pointer transition-colors"
                  onClick={() => router.push('/jobs')}
                >
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{status.count}</p>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{status.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Clients */}
          {topClients.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Clients</h2>
                <button
                  onClick={() => router.push('/clients')}
                  className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                >
                  View all
                </button>
              </div>
              <div className="space-y-3">
                {topClients.map(({ client, revenue }) => (
                  <div
                    key={client!.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    onClick={() => router.push('/clients')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{client!.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {client!.email || client!.phone || 'No contact info'}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white ml-3">
                      ${revenue.toFixed(0)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
              <button
                onClick={() => router.push('/jobs')}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                View all
              </button>
            </div>
            {recentJobs.length === 0 ? (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                No recent activity
              </p>
            ) : (
              <div className="space-y-2">
                {recentJobs.map(job => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg cursor-pointer transition-colors"
                    onClick={() => router.push('/jobs')}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 dark:text-white truncate">{job.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{job.clientName}</p>
                    </div>
                    <StatusBadge status={job.status} className="ml-3" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Quick Actions & Alerts */}
        <div className="space-y-4 lg:space-y-6">
          {/* Quick Actions */}
          <div className="lg:hidden">
            <CollapsibleSection
              title="Quick Actions"
              defaultExpanded={true}
              icon={
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            >
              <div className="space-y-2">
                <button
                  onClick={() => setIsCreateJobOpen(true)}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-left"
                >
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  <span className="font-medium text-slate-900 dark:text-slate-100">Create Job</span>
                </button>

                <button
                  onClick={() => router.push('/clients')}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-left"
                >
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  <span className="font-medium text-slate-900 dark:text-slate-100">Add Client</span>
                </button>

                <button
                  onClick={() => router.push('/team')}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-left"
                >
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                  <span className="font-medium text-slate-900 dark:text-slate-100">Manage Team</span>
                </button>

                <button
                  onClick={() => router.push('/inventory')}
                  className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-left"
                >
                  <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <span className="font-medium text-slate-900 dark:text-slate-100">Check Inventory</span>
                </button>
              </div>
            </CollapsibleSection>
          </div>

          {/* This Week - Upcoming Jobs */}
          {upcomingThisWeek.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-800/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">This Week</h2>
                </div>
                <button onClick={() => router.push('/schedule')} className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200">Schedule</button>
              </div>
              <div className="space-y-2">
                {upcomingThisWeek.map(job => {
                  const daysUntil = Math.ceil(((job.dueDate ?? 0) - Date.now()) / (1000 * 60 * 60 * 24))
                  const dayLabel = daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : new Date(job.dueDate!).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
                  return (
                    <div key={job.id} className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/10 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer transition-colors" onClick={() => router.push('/jobs')}>
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
            </div>
          )}

          {/* Desktop Quick Actions - Always Expanded */}
          <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button
                onClick={() => setIsCreateJobOpen(true)}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-left"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="font-medium text-slate-900 dark:text-slate-100">Create Job</span>
              </button>

              <button
                onClick={() => router.push('/clients')}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-left"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="font-medium text-slate-900 dark:text-slate-100">Add Client</span>
              </button>

              <button
                onClick={() => router.push('/team')}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-left"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <span className="font-medium text-slate-900 dark:text-slate-100">Manage Team</span>
              </button>

              <button
                onClick={() => router.push('/inventory')}
                className="w-full flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors text-left"
              >
                <svg className="w-5 h-5 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                <span className="font-medium text-slate-900 dark:text-slate-100">Check Inventory</span>
              </button>
            </div>
          </div>

          {/* Inventory Alerts */}
          {lowStockItems.length > 0 && (
            <>
              {/* Mobile Collapsible */}
              <div className="lg:hidden">
                <CollapsibleSection
                  title="Low Stock Alerts"
                  badge={lowStockItems.length}
                  variant="alert"
                  icon={
                    <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  }
                >
                  <div className="space-y-2">
                    {lowStockItems.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                        onClick={() => router.push('/inventory')}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.currentStock} {item.unit} left
                          </p>
                        </div>
                        <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 ml-2">
                          LOW
                        </span>
                      </div>
                    ))}
                    {lowStockItems.length > 5 && (
                      <button
                        onClick={() => router.push('/inventory')}
                        className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-center py-1"
                      >
                        +{lowStockItems.length - 5} more
                      </button>
                    )}
                  </div>
                </CollapsibleSection>
              </div>

              {/* Desktop Always Expanded */}
              <div className="hidden lg:block bg-white dark:bg-gray-800 rounded-lg border border-orange-200 dark:border-orange-800/50 p-4">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-orange-500 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Low Stock Alerts</h2>
                </div>
                <div className="space-y-2">
                  {lowStockItems.slice(0, 5).map(item => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/10 rounded-lg cursor-pointer hover:bg-orange-100 dark:hover:bg-orange-900/20 transition-colors"
                      onClick={() => router.push('/inventory')}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm truncate">{item.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {item.currentStock} {item.unit} left
                        </p>
                      </div>
                      <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 ml-2">
                        LOW
                      </span>
                    </div>
                  ))}
                  {lowStockItems.length > 5 && (
                    <button
                      onClick={() => router.push('/inventory')}
                      className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-center py-1"
                    >
                      +{lowStockItems.length - 5} more
                    </button>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Outstanding Invoices */}
          {invoices.filter(inv => inv.status !== 'Paid').length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Outstanding Invoices</h2>
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${getTotalOutstanding().toFixed(0)}
                </span>
              </div>
              <div className="space-y-2">
                {invoices
                  .filter(inv => inv.status !== 'Paid')
                  .sort((a, b) => {
                    // Overdue first
                    if (a.status === 'Overdue' && b.status !== 'Overdue') return -1
                    if (a.status !== 'Overdue' && b.status === 'Overdue') return 1
                    // Then by due date
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
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          isOverdue 
                            ? 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20' 
                            : 'bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700'
                        }`}
                        onClick={() => {
                          if (invoice.jobId) router.push(`/jobs?id=${invoice.jobId}`)
                          else router.push('/invoices')
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white text-sm truncate">
                            INV-{invoice.invoiceNumber}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {job?.clientName || 'Unknown'} • Due {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className={`text-sm font-semibold ${
                            isOverdue 
                              ? 'text-red-600 dark:text-red-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            ${balance.toFixed(0)}
                          </p>
                          {isOverdue && (
                            <span className="text-xs font-medium text-red-600 dark:text-red-400">
                              OVERDUE
                            </span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                {invoices.filter(inv => inv.status !== 'Paid').length > 5 && (
                  <button
                    onClick={() => router.push('/jobs')}
                    className="w-full text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 text-center py-1"
                  >
                    +{invoices.filter(inv => inv.status !== 'Paid').length - 5} more
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Team Summary */}
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Team</h2>
              <button
                onClick={() => router.push('/team')}
                className="text-sm text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              >
                Manage
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Active Members</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {members.filter(m => m.active).length}
                </span>
              </div>
              <div className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Members</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {members.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <CreateJobModal isOpen={isCreateJobOpen} onClose={() => setIsCreateJobOpen(false)} />
    </>
  )
}
