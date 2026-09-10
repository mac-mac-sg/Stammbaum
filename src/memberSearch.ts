import type { FamilyMember } from './familyGraph'

export function normalizeSearchQuery(value: string) {
  return value.trim().toLocaleLowerCase('de-CH')
}

export function familyMemberSearchText(member: FamilyMember, protectedMember: boolean) {
  return [
    member.name,
    ...(protectedMember ? [] : [member.birth, member.birthPlace, member.death, member.deathPlace]),
  ].filter(Boolean).join(' ').toLocaleLowerCase('de-CH')
}

export function matchesFamilyMember(member: FamilyMember, query: string, protectedMember: boolean) {
  const normalized = normalizeSearchQuery(query)
  if (!normalized) return false
  return familyMemberSearchText(member, protectedMember).includes(normalized)
}

export function searchFamilyMembers(
  members: FamilyMember[],
  query: string,
  isProtected: (member: FamilyMember) => boolean,
  limit = 28,
  excludeId?: string,
) {
  const normalized = normalizeSearchQuery(query)
  if (!normalized) return []

  return members
    .filter((member) => member.id !== excludeId)
    .filter((member) => familyMemberSearchText(member, isProtected(member)).includes(normalized))
    .slice(0, limit)
}
