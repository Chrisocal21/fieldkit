/**
 * User-scoped localStorage storage for Zustand persist middleware.
 *
 * Every store key is suffixed with the current Clerk user ID so that
 * different users logging in on the same browser see only their own data.
 *
 * Flow:
 *  1. User signs in → Clerk provides userId
 *  2. StoreRehydrator calls setCurrentUserId(userId)
 *  3. StoreRehydrator calls rehydrate() on every store
 *  4. Each store re-reads its localStorage key (now namespaced with userId)
 *  5. User signs out → setCurrentUserId(null) → rehydrate clears/resets stores
 */

let _userId: string | null = null

export function setCurrentUserId(id: string | null) {
  _userId = id
}

export function getCurrentUserId() {
  return _userId
}

function scopedKey(name: string): string {
  return _userId ? `${name}__${_userId}` : name
}

import { type StateStorage } from 'zustand/middleware'

export const userScopedStorage: StateStorage = {
  getItem: (name: string): string | null => {
    if (typeof window === 'undefined') return null
    return localStorage.getItem(scopedKey(name))
  },
  setItem: (name: string, value: string): void => {
    if (typeof window === 'undefined') return
    localStorage.setItem(scopedKey(name), value)
  },
  removeItem: (name: string): void => {
    if (typeof window === 'undefined') return
    localStorage.removeItem(scopedKey(name))
  },
}
