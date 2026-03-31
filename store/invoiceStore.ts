import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export type InvoiceStatus = 'Unpaid' | 'Partial' | 'Paid' | 'Overdue'
export type PaymentMethod = 'Cash' | 'Check' | 'Credit Card' | 'Bank Transfer' | 'Other'

export interface Payment {
  id: string
  invoiceId: string
  amount: number
  paymentMethod: PaymentMethod
  paymentDate: number
  notes?: string
}

export interface Invoice {
  id: string
  invoiceNumber: number
  jobId: string
  quoteId?: string
  amountDue: number
  amountPaid: number
  status: InvoiceStatus
  dueDate?: number
  issuedAt: number
  payments: Payment[]
  notes?: string
  createdAt: number
  updatedAt: number
}

interface InvoiceState {
  invoices: Invoice[]
  nextInvoiceNumber: number
  
  // CRUD operations
  createInvoice: (invoiceData: Omit<Invoice, 'id' | 'invoiceNumber' | 'amountPaid' | 'status' | 'payments' | 'createdAt' | 'updatedAt'>) => Invoice
  updateInvoice: (id: string, updates: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void
  getInvoiceById: (id: string) => Invoice | undefined
  getInvoicesByJobId: (jobId: string) => Invoice[]
  
  // Payment operations
  addPayment: (invoiceId: string, paymentData: Omit<Payment, 'id' | 'invoiceId'>) => void
  deletePayment: (invoiceId: string, paymentId: string) => void
  
  // Helper functions
  calculateBalance: (invoiceId: string) => number
  updateInvoiceStatus: (invoiceId: string) => void
  getOverdueInvoices: () => Invoice[]
  getTotalOutstanding: () => number
}

// Mock invoices for development
const mockInvoices: Invoice[] = [
  {
    id: 'INV-0001',
    invoiceNumber: 1001,
    jobId: 'JOB-0001',
    quoteId: 'QUOTE-0001',
    amountDue: 435.00,
    amountPaid: 200.00,
    status: 'Partial',
    dueDate: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 days from now
    issuedAt: Date.now() - (2 * 24 * 60 * 60 * 1000), // 2 days ago
    payments: [
      {
        id: 'PAY-0001',
        invoiceId: 'INV-0001',
        amount: 200.00,
        paymentMethod: 'Check',
        paymentDate: Date.now() - (1 * 24 * 60 * 60 * 1000), // 1 day ago
        notes: 'Deposit payment'
      }
    ],
    notes: 'Wedding signs project - balance due on completion',
    createdAt: Date.now() - (2 * 24 * 60 * 60 * 1000),
    updatedAt: Date.now() - (1 * 24 * 60 * 60 * 1000)
  }
]

export const useInvoiceStore = create<InvoiceState>()(
  persist(
    (set, get) => ({
      invoices: mockInvoices,
      nextInvoiceNumber: 1002,

      createInvoice: (invoiceData) => {
        const state = get()
        const invoice: Invoice = {
          ...invoiceData,
          id: `INV-${nanoid(6).toUpperCase()}`,
          invoiceNumber: state.nextInvoiceNumber,
          amountPaid: 0,
          status: 'Unpaid',
          payments: [],
          createdAt: Date.now(),
          updatedAt: Date.now()
        }

        // Check if overdue at creation (shouldn't happen normally)
        if (invoice.dueDate && invoice.dueDate < Date.now()) {
          invoice.status = 'Overdue'
        }

        set({
          invoices: [...state.invoices, invoice],
          nextInvoiceNumber: state.nextInvoiceNumber + 1
        })

        return invoice
      },

      updateInvoice: (id, updates) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) =>
            invoice.id === id
              ? { ...invoice, ...updates, updatedAt: Date.now() }
              : invoice
          )
        }))
        
        // Update status after changes
        if (!updates.status) {
          get().updateInvoiceStatus(id)
        }
      },

      deleteInvoice: (id) => {
        set((state) => ({
          invoices: state.invoices.filter((invoice) => invoice.id !== id)
        }))
      },

      getInvoiceById: (id) => {
        return get().invoices.find((invoice) => invoice.id === id)
      },

      getInvoicesByJobId: (jobId) => {
        return get().invoices.filter((invoice) => invoice.jobId === jobId)
      },

      addPayment: (invoiceId, paymentData) => {
        const payment: Payment = {
          ...paymentData,
          id: `PAY-${nanoid(6).toUpperCase()}`,
          invoiceId
        }

        set((state) => ({
          invoices: state.invoices.map((invoice) => {
            if (invoice.id === invoiceId) {
              const newAmountPaid = invoice.amountPaid + payment.amount
              return {
                ...invoice,
                payments: [...invoice.payments, payment],
                amountPaid: newAmountPaid,
                updatedAt: Date.now()
              }
            }
            return invoice
          })
        }))

        // Update status after payment
        get().updateInvoiceStatus(invoiceId)
      },

      deletePayment: (invoiceId, paymentId) => {
        set((state) => ({
          invoices: state.invoices.map((invoice) => {
            if (invoice.id === invoiceId) {
              const deletedPayment = invoice.payments.find(p => p.id === paymentId)
              const newPayments = invoice.payments.filter((p) => p.id !== paymentId)
              const newAmountPaid = invoice.amountPaid - (deletedPayment?.amount || 0)
              
              return {
                ...invoice,
                payments: newPayments,
                amountPaid: newAmountPaid,
                updatedAt: Date.now()
              }
            }
            return invoice
          })
        }))

        // Update status after payment deletion
        get().updateInvoiceStatus(invoiceId)
      },

      calculateBalance: (invoiceId) => {
        const invoice = get().getInvoiceById(invoiceId)
        if (!invoice) return 0
        return invoice.amountDue - invoice.amountPaid
      },

      updateInvoiceStatus: (invoiceId) => {
        const invoice = get().getInvoiceById(invoiceId)
        if (!invoice) return

        let newStatus: InvoiceStatus = 'Unpaid'
        
        if (invoice.amountPaid >= invoice.amountDue) {
          newStatus = 'Paid'
        } else if (invoice.amountPaid > 0) {
          newStatus = 'Partial'
        } else if (invoice.dueDate && invoice.dueDate < Date.now()) {
          newStatus = 'Overdue'
        }

        if (invoice.status !== newStatus) {
          set((state) => ({
            invoices: state.invoices.map((inv) =>
              inv.id === invoiceId
                ? { ...inv, status: newStatus, updatedAt: Date.now() }
                : inv
            )
          }))
        }
      },

      getOverdueInvoices: () => {
        const now = Date.now()
        return get().invoices.filter((invoice) => 
          invoice.status !== 'Paid' && 
          invoice.dueDate && 
          invoice.dueDate < now
        )
      },

      getTotalOutstanding: () => {
        return get().invoices
          .filter((invoice) => invoice.status !== 'Paid')
          .reduce((sum, invoice) => sum + (invoice.amountDue - invoice.amountPaid), 0)
      }
    }),
    {
      name: 'fieldkit-invoices',
      version: 1
    }
  )
)
