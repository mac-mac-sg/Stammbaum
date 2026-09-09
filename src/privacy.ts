import type { Partner, Person } from './types'

export type PrivacyMode = 'private' | 'protected'

const MAX_PLAUSIBLE_AGE = 120

function extractYear(value?: string) {
  if (!value) return undefined
  const match = value.match(/^(\d{4})/)
  return match ? Number(match[1]) : undefined
}

export function isPotentiallyLivingRecord(record: Pick<Person | Partner, 'birth' | 'death'>) {
  if (record.death) return false

  const birthYear = extractYear(record.birth)
  if (birthYear) {
    return new Date().getFullYear() - birthYear <= MAX_PLAUSIBLE_AGE
  }

  // Ohne Sterbe- und Geburtsangabe behandeln wir den Datensatz vorsichtshalber als potenziell lebend.
  return true
}

export function isProtectedPerson(person: Person, mode: PrivacyMode) {
  return mode === 'protected' && isPotentiallyLivingRecord(person)
}

export function isProtectedPartner(partner: Partner, mode: PrivacyMode) {
  return mode === 'protected' && isPotentiallyLivingRecord(partner)
}

export function protectedLifeLabel(person: Person, mode: PrivacyMode) {
  return isProtectedPerson(person, mode) ? 'Lebensdaten geschützt' : undefined
}

export function protectedSearchParts(person: Person, mode: PrivacyMode) {
  if (!isProtectedPerson(person, mode)) {
    return [person.birth, person.birthPlace, person.death, person.deathPlace]
  }

  return []
}

export function privacyModeLabel(mode: PrivacyMode) {
  return mode === 'protected' ? 'Schutzmodus aktiv' : 'Private Vollansicht'
}
