import type { Partner, Person } from './types'

export type PrivacyMode = 'private' | 'protected'
export type LifeStatus = 'living' | 'deceased' | 'unknown'

const MAX_PLAUSIBLE_AGE = 120

type LivingRecord = Pick<Person | Partner, 'birth' | 'death'> & {
  lifeStatus?: LifeStatus
}

function extractYear(value?: string) {
  if (!value) return undefined
  const match = value.match(/^(\d{4})/)
  return match ? Number(match[1]) : undefined
}

export function isPotentiallyLivingRecord(
  record: LivingRecord,
  explicitStatus: LifeStatus = record.lifeStatus ?? 'unknown',
) {
  if (explicitStatus === 'living') return true
  if (explicitStatus === 'deceased') return false
  if (record.death) return false

  const birthYear = extractYear(record.birth)
  if (birthYear) {
    return new Date().getFullYear() - birthYear <= MAX_PLAUSIBLE_AGE
  }

  // Ohne Sterbe- und Geburtsangabe behandeln wir den Datensatz vorsichtshalber als potenziell lebend.
  return true
}

export function isProtectedPerson(
  person: Person,
  mode: PrivacyMode,
  explicitStatus: LifeStatus = 'unknown',
) {
  return mode === 'protected' && isPotentiallyLivingRecord(person, explicitStatus)
}

export function isProtectedPartner(partner: Partner, mode: PrivacyMode) {
  return mode === 'protected' && isPotentiallyLivingRecord(partner)
}

export function protectedLifeLabel(
  person: Person,
  mode: PrivacyMode,
  explicitStatus: LifeStatus = 'unknown',
) {
  return isProtectedPerson(person, mode, explicitStatus) ? 'Lebensdaten geschützt' : undefined
}

export function protectedSearchParts(
  person: Person,
  mode: PrivacyMode,
  explicitStatus: LifeStatus = 'unknown',
) {
  if (!isProtectedPerson(person, mode, explicitStatus)) {
    return [person.birth, person.birthPlace, person.death, person.deathPlace]
  }

  return []
}

export function privacyModeLabel(mode: PrivacyMode) {
  return mode === 'protected' ? 'Schutzmodus aktiv' : 'Private Vollansicht'
}

export function lifeStatusLabel(status: LifeStatus) {
  if (status === 'living') return 'lebend'
  if (status === 'deceased') return 'verstorben'
  return 'nicht fachlich festgelegt'
}
