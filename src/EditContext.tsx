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

export interface ImportEditsResult {
  imported: number
  skipped: number
}

interface EditContextValue {
  edits: Record<string, PersonEdit>
  getPerson: (id: string) => Person | undefined
  getLifeStatus: (id: string) => LifeStatus
  getEdit: (id: string) => PersonEdit | undefined
  hasEdit: (id: string) => boolean
  saveEdit: (id: string, edit: Omit<PersonEdit, 'updatedAt'>) => void
  resetEdit: (id: string) => void
  importEdits: (value: unknown) => ImportEditsResult
  clearAllEdits: () => void
  editedCount: number
}

const STORAGE_KEY = 'stammbaum-person-edits-v1'
const EditContext = createContext<EditContextValue | null>(null)

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function sanitizeEdit(value: unknown): PersonEdit | null {
  if (!isObject(value)) return null

  const lifeStatus = value.lifeStatus
  if (
    lifeStatus !== undefined &&
    lifeStatus !== 'unknown' &&
    lifeStatus !== 'living' &&
    lifeStatus !== 'deceased'
  ) return null

  const result: PersonEdit = {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  }

  for (const field of ['birth', 'birthPlace', 'death', 'deathPlace', 'notes'] as const) {
    const fieldValue = value[field]
    if (fieldValue !== undefined && typeof fieldValue !== 'string') return null
    if (typeof fieldValue === 'string') result[field] = fieldValue
  }

  if (lifeStatus) result.lifeStatus = lifeStatus
  return result
}

function readStoredEdits(): Record<string, PersonEdit> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!isObject(parsed)) return {}

    const safe: Record<string, PersonEdit> = {}
    for (const [id, value] of Object.entries(parsed)) {
      if (!peopleById[id]) continue
      const edit = sanitizeEdit(value)
      if (edit) safe[id] = edit
    }
    return safe
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

  const importEdits = useCallback((value: unknown): ImportEditsResult => {
    const container = isObject(value) && isObject(value.edits) ? value.edits : value
    if (!isObject(container)) return { imported: 0, skipped: 1 }

    const imported: Record<string, PersonEdit> = {}
    let skipped = 0

    for (const [id, rawEdit] of Object.entries(container)) {
      if (!peopleById[id]) {
        skipped += 1
        continue
      }
      const edit = sanitizeEdit(rawEdit)
      if (!edit) {
        skipped += 1
        continue
      }
      imported[id] = edit
    }

    setEdits((current) => ({ ...current, ...imported }))
    return { imported: Object.keys(imported).length, skipped }
  }, [])

  const clearAllEdits = useCallback(() => setEdits({}), [])

  const value = useMemo<EditContextValue>(() => ({
    edits,
    getPerson,
    getLifeStatus,
    getEdit,
    hasEdit,
    saveEdit,
    resetEdit,
    importEdits,
    clearAllEdits,
    editedCount: Object.keys(edits).length,
  }), [clearAllEdits, edits, getEdit, getLifeStatus, getPerson, hasEdit, importEdits, resetEdit, saveEdit])

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>
}

export function useEdits() {
  const context = useContext(EditContext)
  if (!context) throw new Error('useEdits must be used inside EditProvider')
  return context
}
