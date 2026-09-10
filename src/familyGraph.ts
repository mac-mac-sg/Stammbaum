import { people, peopleById } from './data'
import type { Partner, Person } from './types'

export type FamilyMemberKind = 'descendant' | 'partner'

export interface FamilyMember {
  id: string
  kind: FamilyMemberKind
  name: string
  generation: Person['generation']
  source: number
  number?: number
  birth?: string
  birthPlace?: string
  death?: string
  deathPlace?: string
  notes?: string
  lifeStatus?: 'living' | 'deceased' | 'unknown'
  linkedPersonId?: string
  partnerIndex?: number
  relationship?: Partner['relationship']
  relationshipStatus?: Partner['status']
}

export interface CoupleRelation {
  id: string
  personId: string
  partnerId: string
  relationship: Partner['relationship']
  status?: Partner['status']
  source: number
}

export function partnerMemberId(personId: string, partnerIndex: number) {
  return `partner:${personId}:${partnerIndex + 1}`
}

export function descendantMember(person: Person): FamilyMember {
  return {
    id: person.id,
    kind: 'descendant',
    name: person.name,
    generation: person.generation,
    source: person.source,
    number: person.number,
    birth: person.birth,
    birthPlace: person.birthPlace,
    death: person.death,
    deathPlace: person.deathPlace,
    notes: person.notes,
  }
}

export function partnerMembersForPerson(person: Person): FamilyMember[] {
  return person.partners.map((partner, partnerIndex) => ({
    id: partnerMemberId(person.id, partnerIndex),
    kind: 'partner' as const,
    name: partner.name,
    generation: person.generation,
    source: person.source,
    birth: partner.birth,
    birthPlace: partner.birthPlace,
    death: partner.death,
    deathPlace: partner.deathPlace,
    notes: partner.notes,
    lifeStatus: partner.lifeStatus,
    linkedPersonId: person.id,
    partnerIndex,
    relationship: partner.relationship,
    relationshipStatus: partner.status,
  }))
}

export function buildFamilyMembers(descendants: Person[] = people): FamilyMember[] {
  return descendants.flatMap((person) => [
    descendantMember(person),
    ...partnerMembersForPerson(person),
  ])
}

export const partnerMembers = people.flatMap(partnerMembersForPerson)
export const familyMembers = buildFamilyMembers(people)
export const familyMembersById = Object.fromEntries(
  familyMembers.map((member) => [member.id, member]),
) as Record<string, FamilyMember>

export const coupleRelations: CoupleRelation[] = people.flatMap((person) =>
  person.partners.map((partner, partnerIndex) => ({
    id: `couple:${person.id}:${partnerIndex + 1}`,
    personId: person.id,
    partnerId: partnerMemberId(person.id, partnerIndex),
    relationship: partner.relationship,
    status: partner.status,
    source: person.source,
  })),
)

export function linkedDescendant(member: FamilyMember): Person | undefined {
  const id = member.kind === 'partner' ? member.linkedPersonId : member.id
  return id ? peopleById[id] : undefined
}

export function getFamilyMember(id: string) {
  return familyMembersById[id]
}

export function relationLabel(member: FamilyMember) {
  if (member.kind === 'descendant') return 'Nachkomme'
  if (member.relationship === 'Ehe') {
    if (member.relationshipStatus === 'geschieden') return 'ehem. Ehepartner/in'
    if (member.relationshipStatus === 'annulliert') return 'annullierte Ehe'
    return 'Ehepartner/in'
  }
  if (member.relationship === 'Verlobung') return 'Verlobte/r'
  return 'Partner/in'
}
