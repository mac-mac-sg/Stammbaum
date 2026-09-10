import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { familyMembersById } from './familyGraph'

interface FamilyNavigationContextValue {
  recentIds: string[]
  favoriteIds: string[]
  recordVisit: (id: string) => void
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  clearRecent: () => void
}

const RECENT_KEY = 'stammbaum-recent-members-v1'
const FAVORITES_KEY = 'stammbaum-favorite-members-v1'
const MAX_RECENT = 12

const FamilyNavigationContext = createContext<FamilyNavigationContextValue | null>(null)

function readIds(key: string): string[] {
  if (typeof window === 'undefined') return []
  try {
    const parsed = JSON.parse(window.localStorage.getItem(key) ?? '[]')
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((id): id is string => typeof id === 'string' && Boolean(familyMembersById[id]))
      .filter((id, index, values) => values.indexOf(id) === index)
  } catch {
    return []
  }
}

export function FamilyNavigationProvider({ children }: { children: ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>(() => readIds(RECENT_KEY))
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => readIds(FAVORITES_KEY))

  useEffect(() => {
    window.localStorage.setItem(RECENT_KEY, JSON.stringify(recentIds))
  }, [recentIds])

  useEffect(() => {
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoriteIds))
  }, [favoriteIds])

  const recordVisit = useCallback((id: string) => {
    if (!familyMembersById[id]) return
    setRecentIds((current) => [id, ...current.filter((candidate) => candidate !== id)].slice(0, MAX_RECENT))
  }, [])

  const toggleFavorite = useCallback((id: string) => {
    if (!familyMembersById[id]) return
    setFavoriteIds((current) => current.includes(id)
      ? current.filter((candidate) => candidate !== id)
      : [id, ...current])
  }, [])

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds])
  const clearRecent = useCallback(() => setRecentIds([]), [])

  const value = useMemo<FamilyNavigationContextValue>(() => ({
    recentIds,
    favoriteIds,
    recordVisit,
    toggleFavorite,
    isFavorite,
    clearRecent,
  }), [clearRecent, favoriteIds, isFavorite, recentIds, recordVisit, toggleFavorite])

  return <FamilyNavigationContext.Provider value={value}>{children}</FamilyNavigationContext.Provider>
}

export function useFamilyNavigation() {
  const context = useContext(FamilyNavigationContext)
  if (!context) throw new Error('useFamilyNavigation must be used inside FamilyNavigationProvider')
  return context
}
