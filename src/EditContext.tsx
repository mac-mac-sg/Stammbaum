import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { peopleById } from './data'
import type { LifeStatus } from './privacy'
import type { Person } from './types'

export interface PersonEdit {
  birth?: string
  birthPlace?: string
  death?: string
  deathPlace?: string
  notes?: string
  lifeStatus?: LifeStatus
  updatedAt: string
}

interface EditContextValue {
  edits: Record<string, PersonEdit>
  getPerson: (id: string) => Person | undefined
  getLifeStatus: (id: string) => LifeStatus
  getEdit: (id: string) => PersonEdit | undefined
  hasEdit: (id: string) => boolean
  saveEdit: (id: string, edit: Omit<PersonEdit, 'updatedAt'>) => void
  resetEdit: (id: string) => void
  editedCount: number
}

const STORAGE_KEY = 'stammbaum-person-edits-v1'
const EditContext = createContext<EditContextValue | null>(null)

function readStoredEdits(): Record<string, PersonEdit> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

export function EditProvider({ children }: { children: ReactNode }) {
  const [edits, setEdits] = useState<Record<string, PersonEdit>>(readStoredEdits)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(edits))
  }, [edits])

  const getEdit = useCallback((id: string) => edits[id], [edits])

  const getPerson = useCallback((id: string) => {
    const base = peopleById[id]
    if (!base) return undefined
    const edit = edits[id]
    if (!edit) return base

    const { lifeStatus: _lifeStatus, updatedAt: _updatedAt, ...personFields } = edit
    return { ...base, ...personFields }
  }, [edits])

  const getLifeStatus = useCallback((id: string): LifeStatus => {
    return edits[id]?.lifeStatus ?? 'unknown'
  }, [edits])

  const hasEdit = useCallback((id: string) => Boolean(edits[id]), [edits])

  const saveEdit = useCallback((id: string, edit: Omit<PersonEdit, 'updatedAt'>) => {
    if (!peopleById[id]) return
    setEdits((current) => ({
      ...current,
      [id]: {
        ...edit,
        updatedAt: new Date().toISOString(),
      },
    }))
  }, [])

  const resetEdit = useCallback((id: string) => {
    setEdits((current) => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }, [])

  const value = useMemo<EditContextValue>(() => ({
    edits,
    getPerson,
    getLifeStatus,
    getEdit,
    hasEdit,
    saveEdit,
    resetEdit,
    editedCount: Object.keys(edits).length,
  }), [edits, getEdit, getLifeStatus, getPerson, hasEdit, resetEdit, saveEdit])

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>
}

export function useEdits() {
  const context = useContext(EditContext)
  if (!context) throw new Error('useEdits must be used inside EditProvider')
  return context
}
