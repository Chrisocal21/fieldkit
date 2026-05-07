import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { nanoid } from 'nanoid'
import { userScopedStorage } from '@/lib/userStorage'
import api from '@/lib/api'

export type ExpenseCategory = 
  | 'Permits' 
  | 'Subcontractor' 
  | 'Equipment Rental' 
  | 'Disposal' 
  | 'Tools' 
  | 'Vehicle' 
  | 'Insurance' 
  | 'Utilities' 
  | 'Other'

export interface Expense {
  id: string
  jobId?: string  // Optional - null for general overhead expenses
  category: ExpenseCategory
  description: string
  amount: number
  expenseDate: number
  notes?: string
  createdAt: number
  updatedAt: number
}

interface ExpenseState {
  expenses: Expense[]
  
  // CRUD operations
  addExpense: (expenseData: Omit<Expense, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateExpense: (id: string, updates: Partial<Expense>) => void
  deleteExpense: (id: string) => void
  getExpenseById: (id: string) => Expense | undefined
  getExpensesByJobId: (jobId: string) => Expense[]
  getOverheadExpenses: () => Expense[]
  
  // Calculations
  calculateJobExpenses: (jobId: string) => number
  getTotalExpenses: () => number
  getTotalOverhead: () => number
  getExpensesByCategory: (category: ExpenseCategory) => Expense[]
  getExpensesByDateRange: (start: number, end: number) => Expense[]
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],

      addExpense: (expenseData) => {
        const expense: Expense = {
          ...expenseData,
          id: `EXP-${nanoid(6).toUpperCase()}`,
          createdAt: Date.now(),
          updatedAt: Date.now()
        }
        set((state) => ({
          expenses: [...state.expenses, expense]
        }))
        api.expenses.create(expense)
      },

      updateExpense: (id, updates) => {
        set((state) => ({
          expenses: state.expenses.map((expense) =>
            expense.id === id
              ? { ...expense, ...updates, updatedAt: Date.now() }
              : expense
          )
        }))
        api.expenses.update(id, { ...updates, updatedAt: Date.now() })
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id)
        }))
        api.expenses.delete(id)
      },

      getExpenseById: (id) => {
        return get().expenses.find((expense) => expense.id === id)
      },

      getExpensesByJobId: (jobId) => {
        return get().expenses
          .filter((expense) => expense.jobId === jobId)
          .sort((a, b) => b.expenseDate - a.expenseDate)
      },

      getOverheadExpenses: () => {
        return get().expenses
          .filter((expense) => !expense.jobId)
          .sort((a, b) => b.expenseDate - a.expenseDate)
      },

      calculateJobExpenses: (jobId) => {
        return get().expenses
          .filter((expense) => expense.jobId === jobId)
          .reduce((sum, expense) => sum + expense.amount, 0)
      },

      getTotalExpenses: () => {
        return get().expenses.reduce((sum, expense) => sum + expense.amount, 0)
      },

      getTotalOverhead: () => {
        return get().expenses
          .filter((expense) => !expense.jobId)
          .reduce((sum, expense) => sum + expense.amount, 0)
      },

      getExpensesByCategory: (category) => {
        return get().expenses
          .filter((expense) => expense.category === category)
          .sort((a, b) => b.expenseDate - a.expenseDate)
      },

      getExpensesByDateRange: (start, end) => {
        return get().expenses
          .filter((expense) => expense.expenseDate >= start && expense.expenseDate <= end)
          .sort((a, b) => b.expenseDate - a.expenseDate)
      }
    }),
    {
      name: 'fieldkit-expenses',
      storage: userScopedStorage,
      version: 1
    }
  )
)
