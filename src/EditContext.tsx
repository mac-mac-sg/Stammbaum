import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { peopleById } from './data'
import { familyMembersById, partnerMemberId } from './familyGraph'
import type { FamilyMember } from './familyGraph'
import type { LifeStatus } from './privacy'
import type { Partner, Person } from './types'

export interface PersonEdit {
  birth?: string
  birthPlace?: string
  death?: string
  deathPlace?: string
  notes?: string
  lifeStatus?: LifeStatus
  updatedAt: string
}

export interface PartnerEdit {
  birth?: string
  birthPlace?: string
  death?: string
  deathPlace?: string
  notes?: string
  lifeStatus?: LifeStatus
  relationship?: Partner['relationship']
  relationshipStatus?: Partner['status'] | null
  updatedAt: string
}

export interface ImportEditsResult {
  imported: number
  skipped: number
  importedPersons: number
  importedPartners: number
}

interface EditContextValue {
  edits: Record<string, PersonEdit>
  partnerEdits: Record<string, PartnerEdit>
  getPerson: (id: string) => Person | undefined
  getLifeStatus: (id: string) => LifeStatus
  getEdit: (id: string) => PersonEdit | undefined
  hasEdit: (id: string) => boolean
  saveEdit: (id: string, edit: Omit<PersonEdit, 'updatedAt'>) => void
  resetEdit: (id: string) => void
  getPartnerMember: (id: string) => FamilyMember | undefined
  getPartnerLifeStatus: (id: string) => LifeStatus
  getPartnerEdit: (id: string) => PartnerEdit | undefined
  hasPartnerEdit: (id: string) => boolean
  savePartnerEdit: (id: string, edit: Omit<PartnerEdit, 'updatedAt'>) => void
  resetPartnerEdit: (id: string) => void
  importEdits: (value: unknown) => ImportEditsResult
  clearAllEdits: () => void
  editedCount: number
  editedPersonCount: number
  editedPartnerCount: number
}

const STORAGE_KEY = 'stammbaum-person-edits-v1'
const PARTNER_STORAGE_KEY = 'stammbaum-partner-edits-v1'
const EditContext = createContext<EditContextValue | null>(null)

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function validLifeStatus(value: unknown): value is LifeStatus | undefined {
  return value === undefined || value === 'unknown' || value === 'living' || value === 'deceased'
}

function sanitizePersonEdit(value: unknown): PersonEdit | null {
  if (!isObject(value) || !validLifeStatus(value.lifeStatus)) return null

  const result: PersonEdit = {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  }

  for (const field of ['birth', 'birthPlace', 'death', 'deathPlace', 'notes'] as const) {
    const fieldValue = value[field]
    if (fieldValue !== undefined && typeof fieldValue !== 'string') return null
    if (typeof fieldValue === 'string') result[field] = fieldValue
  }

  if (value.lifeStatus) result.lifeStatus = value.lifeStatus
  return result
}

function sanitizePartnerEdit(value: unknown): PartnerEdit | null {
  if (!isObject(value) || !validLifeStatus(value.lifeStatus)) return null
  if (
    value.relationship !== undefined &&
    value.relationship !== 'Ehe' &&
    value.relationship !== 'Partnerschaft' &&
    value.relationship !== 'Verlobung'
  ) return null
  if (
    value.relationshipStatus !== undefined &&
    value.relationshipStatus !== null &&
    value.relationshipStatus !== 'annulliert' &&
    value.relationshipStatus !== 'geschieden'
  ) return null

  const result: PartnerEdit = {
    updatedAt: typeof value.updatedAt === 'string' ? value.updatedAt : new Date().toISOString(),
  }

  for (const field of ['birth', 'birthPlace', 'death', 'deathPlace', 'notes'] as const) {
    const fieldValue = value[field]
    if (fieldValue !== undefined && typeof fieldValue !== 'string') return null
    if (typeof fieldValue === 'string') result[field] = fieldValue
  }

  if (value.lifeStatus) result.lifeStatus = value.lifeStatus
  if (value.relationship) result.relationship = value.relationship
  if (value.relationshipStatus === null || value.relationshipStatus === 'annulliert' || value.relationshipStatus === 'geschieden') {
    result.relationshipStatus = value.relationshipStatus
  }
  return result
}

function readStoredRecord<T>(
  storageKey: string,
  isKnownId: (id: string) => boolean,
  sanitize: (value: unknown) => T | null,
): Record<string, T> {
  if (typeof window === 'undefined') return {}
  try {
    const raw = window.localStorage.getItem(storageKey)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!isObject(parsed)) return {}

    const safe: Record<string, T> = {}
    for (const [id, value] of Object.entries(parsed)) {
      if (!isKnownId(id)) continue
      const edit = sanitize(value)
      if (edit) safe[id] = edit
    }
    return safe
  } catch {
    return {}
  }
}

function isKnownPartnerId(id: string) {
  return familyMembersById[id]?.kind === 'partner'
}

function readStoredEdits() {
  return readStoredRecord(STORAGE_KEY, (id) => Boolean(peopleById[id]), sanitizePersonEdit)
}

function readStoredPartnerEdits() {
  return readStoredRecord(PARTNER_STORAGE_KEY, isKnownPartnerId, sanitizePartnerEdit)
}

export function EditProvider({ children }: { children: ReactNode }) {
  const [edits, setEdits] = useState<Record<string, PersonEdit>>(readStoredEdits)
  const [partnerEdits, setPartnerEdits] = useState<Record<string, PartnerEdit>>(readStoredPartnerEdits)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(edits))
  }, [edits])

  useEffect(() => {
    window.localStorage.setItem(PARTNER_STORAGE_KEY, JSON.stringify(partnerEdits))
  }, [partnerEdits])

  const getEdit = useCallback((id: string) => edits[id], [edits])

  const getPerson = useCallback((id: string) => {
    const base = peopleById[id]
    if (!base) return undefined
    const edit = edits[id]
    const hasPartnerCorrections = base.partners.some((_, index) => Boolean(partnerEdits[partnerMemberId(id, index)]))

    if (!edit && !hasPartnerCorrections) return base

    const personFields = edit
      ? (() => {
          const { lifeStatus: _lifeStatus, updatedAt: _updatedAt, ...fields } = edit
          return fields
        })()
      : {}

    const partners = base.partners.map((partner, index) => {
      const partnerEdit = partnerEdits[partnerMemberId(id, index)]
      if (!partnerEdit) return partner

      const { updatedAt: _updatedAt, relationshipStatus, ...partnerFields } = partnerEdit
      return {
        ...partner,
        ...partnerFields,
        status: relationshipStatus === null ? undefined : relationshipStatus ?? partner.status,
      }
    })

    return { ...base, ...personFields, partners }
  }, [edits, partnerEdits])

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

  const getPartnerEdit = useCallback((id: string) => partnerEdits[id], [partnerEdits])

  const getPartnerMember = useCallback((id: string): FamilyMember | undefined => {
    const base = familyMembersById[id]
    if (!base || base.kind !== 'partner') return undefined
    const edit = partnerEdits[id]
    if (!edit) return base

    const {
      updatedAt: _updatedAt,
      relationshipStatus,
      ...memberFields
    } = edit

    return {
      ...base,
      ...memberFields,
      relationshipStatus: relationshipStatus === null ? undefined : relationshipStatus ?? base.relationshipStatus,
    }
  }, [partnerEdits])

  const getPartnerLifeStatus = useCallback((id: string): LifeStatus => {
    return partnerEdits[id]?.lifeStatus ?? 'unknown'
  }, [partnerEdits])

  const hasPartnerEdit = useCallback((id: string) => Boolean(partnerEdits[id]), [partnerEdits])

  const savePartnerEdit = useCallback((id: string, edit: Omit<PartnerEdit, 'updatedAt'>) => {
    if (!isKnownPartnerId(id)) return
    setPartnerEdits((current) => ({
      ...current,
      [id]: {
        ...edit,
        updatedAt: new Date().toISOString(),
      },
    }))
  }, [])

  const resetPartnerEdit = useCallback((id: string) => {
    setPartnerEdits((current) => {
      if (!current[id]) return current
      const next = { ...current }
      delete next[id]
      return next
    })
  }, [])

  const importEdits = useCallback((value: unknown): ImportEditsResult => {
    if (!isObject(value)) return { imported: 0, skipped: 1, importedPersons: 0, importedPartners: 0 }

    // Version 1 exports used `edits`; version 2 separates descendant and partner corrections.
    const personContainer = isObject(value.personEdits)
      ? value.personEdits
      : isObject(value.edits)
        ? value.edits
        : value.schema === undefined
          ? value
          : {}
    const partnerContainer = isObject(value.partnerEdits) ? value.partnerEdits : {}

    const importedPersons: Record<string, PersonEdit> = {}
    const importedPartners: Record<string, PartnerEdit> = {}
    let skipped = 0

    for (const [id, rawEdit] of Object.entries(personContainer)) {
      if (!peopleById[id]) {
        skipped += 1
        continue
      }
      const edit = sanitizePersonEdit(rawEdit)
      if (!edit) {
        skipped += 1
        continue
      }
      importedPersons[id] = edit
    }

    for (const [id, rawEdit] of Object.entries(partnerContainer)) {
      if (!isKnownPartnerId(id)) {
        skipped += 1
        continue
      }
      const edit = sanitizePartnerEdit(rawEdit)
      if (!edit) {
        skipped += 1
        continue
      }
      importedPartners[id] = edit
    }

    setEdits((current) => ({ ...current, ...importedPersons }))
    setPartnerEdits((current) => ({ ...current, ...importedPartners }))

    const importedPersonCount = Object.keys(importedPersons).length
    const importedPartnerCount = Object.keys(importedPartners).length
    return {
      imported: importedPersonCount + importedPartnerCount,
      skipped,
      importedPersons: importedPersonCount,
      importedPartners: importedPartnerCount,
    }
  }, [])

  const clearAllEdits = useCallback(() => {
    setEdits({})
    setPartnerEdits({})
  }, [])

  const editedPersonCount = Object.keys(edits).length
  const editedPartnerCount = Object.keys(partnerEdits).length

  const value = useMemo<EditContextValue>(() => ({
    edits,
    partnerEdits,
    getPerson,
    getLifeStatus,
    getEdit,
    hasEdit,
    saveEdit,
    resetEdit,
    getPartnerMember,
    getPartnerLifeStatus,
    getPartnerEdit,
    hasPartnerEdit,
    savePartnerEdit,
    resetPartnerEdit,
    importEdits,
    clearAllEdits,
    editedCount: editedPersonCount + editedPartnerCount,
    editedPersonCount,
    editedPartnerCount,
  }), [
    clearAllEdits,
    editedPartnerCount,
    editedPersonCount,
    edits,
    getEdit,
    getLifeStatus,
    getPartnerEdit,
    getPartnerLifeStatus,
    getPartnerMember,
    getPerson,
    hasEdit,
    hasPartnerEdit,
    importEdits,
    partnerEdits,
    resetEdit,
    resetPartnerEdit,
    saveEdit,
    savePartnerEdit,
  ])

  return <EditContext.Provider value={value}>{children}</EditContext.Provider>
}

export function useEdits() {
  const context = useContext(EditContext)
  if (!context) throw new Error('useEdits must be used inside EditProvider')
  return context
}
