import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'

export interface QuoteLineItem {
  id: string
  quoteId: string
  description: string
  quantity: number
  unitPrice: number
  type: 'material' | 'labor' | 'other'
  sortOrder: number
}

export interface Quote {
  id: string
  quoteNumber: number
  clientName: string
  clientEmail?: string
  clientPhone?: string
  notes: string
  taxRate: number
  expiryDate?: number
  status: 'Draft' | 'Sent' | 'Accepted' | 'Declined'
  lineItems: QuoteLineItem[]
  createdAt: number
  updatedAt: number
}

interface QuoteState {
  quotes: Quote[]
  addQuote: (quote: Omit<Quote, 'id' | 'quoteNumber' | 'createdAt' | 'updatedAt'>) => void
  updateQuote: (id: string, updates: Partial<Quote>) => void
  getQuoteById: (id: string) => Quote | undefined
}

const mockQuotes: Quote[] = [
  {
    id: nanoid(),
    quoteNumber: 1001,
    clientName: 'Sarah Johnson',
    clientEmail: 'sarah@example.com',
    notes: 'Wedding signs, walnut finish',
    taxRate: 0.08,
    status: 'Accepted',
    lineItems: [
      {
        id: nanoid(),
        quoteId: 'temp',
        description: 'Walnut wood boards (3)',
        quantity: 3,
        unitPrice: 45.00,
        type: 'material',
        sortOrder: 0,
      },
      {
        id: nanoid(),
        quoteId: 'temp',
        description: 'Laser engraving & finishing',
        quantity: 3,
        unitPrice: 75.00,
        type: 'labor',
        sortOrder: 1,
      },
    ],
    createdAt: Date.now() - 86400000 * 5,
    updatedAt: Date.now() - 86400000 * 3,
  },
]

export const useQuoteStore = create<QuoteState>()(
  persist(
    (set, get) => ({
      quotes: mockQuotes,
      
      addQuote: (quoteData) => {
        const quotes = get().quotes
        const newQuote: Quote = {
          ...quoteData,
          id: nanoid(),
          quoteNumber: quotes.length > 0 ? Math.max(...quotes.map(q => q.quoteNumber)) + 1 : 1001,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        }
        set((state) => ({ quotes: [...state.quotes, newQuote] }))
      },
      
      updateQuote: (id, updates) => {
        set((state) => ({
          quotes: state.quotes.map((quote) =>
            quote.id === id ? { ...quote, ...updates, updatedAt: Date.now() } : quote
          ),
        }))
      },
      
      getQuoteById: (id) => {
        return get().quotes.find((quote) => quote.id === id)
      },
    }),
    {
      name: 'fieldkit-quotes',
    }
  )
)
