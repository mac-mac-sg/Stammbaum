import { peopleById } from './data'
import { descendantMember, linkedDescendant, relationLabel } from './familyGraph'
import type { FamilyMember } from './familyGraph'
import type { Person } from './types'

export interface RelationshipResult {
  commonAncestor: Person
  distanceFromA: number
  distanceFromB: number
  labelFromAToB: string
  explanation: string
  path: Person[]
}

export interface MemberRelationshipResult {
  labelFromAToB: string
  explanation: string
  path: FamilyMember[]
  commonAncestor?: Person
  connectionKind: 'blood' | 'partner' | 'mixed'
}

function pathToRoot(personId: string) {
  const path: Person[] = []
  let current: Person | undefined = peopleById[personId]
  while (current) {
    path.unshift(current)
    current = current.parentId ? peopleById[current.parentId] : undefined
  }
  return path
}

function ancestorLabel(distance: number) {
  if (distance === 1) return 'Elternteil'
  if (distance === 2) return 'Grosselternteil'
  if (distance === 3) return 'Urgrosselternteil'
  return `${'Ur'.repeat(Math.max(1, distance - 2))}grosselternteil`
}

function descendantLabel(distance: number) {
  if (distance === 1) return 'Kind'
  if (distance === 2) return 'Enkelkind'
  if (distance === 3) return 'Urenkelkind'
  return `${'Ur'.repeat(Math.max(1, distance - 2))}enkelkind`
}

function avuncularLabel(generationGap: number, olderSide: boolean) {
  const prefix = generationGap <= 1 ? '' : `${'Gross'.repeat(generationGap - 1)}`
  return olderSide ? `${prefix}tante/-onkel` : `${prefix}nichte/-neffe`
}

function cousinLabel(degree: number, removed: number) {
  const base = `Cousin/Cousine ${degree}. Grades`
  if (removed === 0) return base
  if (removed === 1) return `${base}, einmal generationsversetzt`
  return `${base}, ${removed}-mal generationsversetzt`
}

export function getRelationship(a: Person, b: Person): RelationshipResult | null {
  if (a.id === b.id) {
    return {
      commonAncestor: a,
      distanceFromA: 0,
      distanceFromB: 0,
      labelFromAToB: 'dieselbe Person',
      explanation: `${a.name} und ${b.name} sind dieselbe Person.`,
      path: [a],
    }
  }

  const pathA = pathToRoot(a.id)
  const pathB = pathToRoot(b.id)
  let commonIndex = -1
  const sharedLength = Math.min(pathA.length, pathB.length)

  for (let index = 0; index < sharedLength; index += 1) {
    if (pathA[index]?.id !== pathB[index]?.id) break
    commonIndex = index
  }

  if (commonIndex < 0) return null

  const commonAncestor = pathA[commonIndex]
  if (!commonAncestor) return null

  const distanceFromA = pathA.length - commonIndex - 1
  const distanceFromB = pathB.length - commonIndex - 1

  let labelFromAToB: string
  if (distanceFromA === 0) {
    labelFromAToB = ancestorLabel(distanceFromB)
  } else if (distanceFromB === 0) {
    labelFromAToB = descendantLabel(distanceFromA)
  } else if (distanceFromA === 1 && distanceFromB === 1) {
    labelFromAToB = 'Geschwister'
  } else if (distanceFromA === 1 || distanceFromB === 1) {
    const olderSide = distanceFromA === 1
    const generationGap = Math.abs(distanceFromA - distanceFromB)
    labelFromAToB = avuncularLabel(generationGap, olderSide)
  } else {
    const degree = Math.min(distanceFromA, distanceFromB) - 1
    const removed = Math.abs(distanceFromA - distanceFromB)
    labelFromAToB = cousinLabel(degree, removed)
  }

  const upwards = pathA.slice(commonIndex).reverse()
  const downwards = pathB.slice(commonIndex + 1)
  const relationshipPath = [...upwards, ...downwards]

  const explanation = `${a.name} ist zu ${b.name}: ${labelFromAToB}. Gemeinsame Bezugsperson in den erfassten Unterlagen ist ${commonAncestor.name}.`

  return {
    commonAncestor,
    distanceFromA,
    distanceFromB,
    labelFromAToB,
    explanation,
    path: relationshipPath,
  }
}

function directPartnerResult(a: FamilyMember, b: FamilyMember): MemberRelationshipResult | null {
  if (a.kind === 'partner' && a.linkedPersonId === b.id) {
    return {
      labelFromAToB: relationLabel(a),
      explanation: `${a.name} ist als ${relationLabel(a)} von ${b.name} in den Familienunterlagen erfasst.`,
      path: [a, b],
      connectionKind: 'partner',
    }
  }

  if (b.kind === 'partner' && b.linkedPersonId === a.id) {
    return {
      labelFromAToB: relationLabel(b),
      explanation: `${a.name} ist mit ${b.name} über die erfasste Beziehung «${b.relationship ?? 'Partnerschaft'}» verbunden.`,
      path: [a, b],
      connectionKind: 'partner',
    }
  }

  return null
}

export function getMemberRelationship(a: FamilyMember, b: FamilyMember): MemberRelationshipResult | null {
  if (a.id === b.id) {
    return {
      labelFromAToB: 'dieselbe Person',
      explanation: `${a.name} und ${b.name} sind dieselbe Person.`,
      path: [a],
      connectionKind: a.kind === 'partner' ? 'partner' : 'blood',
    }
  }

  const direct = directPartnerResult(a, b)
  if (direct) return direct

  const linkedA = linkedDescendant(a)
  const linkedB = linkedDescendant(b)
  if (!linkedA || !linkedB) return null

  const blood = getRelationship(linkedA, linkedB)
  if (!blood) return null

  const bloodPath = blood.path.map(descendantMember)

  if (a.kind === 'descendant' && b.kind === 'descendant') {
    return {
      labelFromAToB: blood.labelFromAToB,
      explanation: blood.explanation,
      path: bloodPath,
      commonAncestor: blood.commonAncestor,
      connectionKind: 'blood',
    }
  }

  const path: FamilyMember[] = []
  if (a.kind === 'partner') path.push(a)
  path.push(...bloodPath)
  if (b.kind === 'partner') path.push(b)

  if (a.kind === 'partner' && b.kind === 'partner') {
    return {
      labelFromAToB: 'über Partnerschaften verbunden',
      explanation: `${a.name} ist ${relationLabel(a)} von ${linkedA.name}; ${linkedA.name} ist zu ${linkedB.name}: ${blood.labelFromAToB}; ${b.name} ist ${relationLabel(b)} von ${linkedB.name}.`,
      path,
      commonAncestor: blood.commonAncestor,
      connectionKind: 'mixed',
    }
  }

  const partner = a.kind === 'partner' ? a : b
  const linked = a.kind === 'partner' ? linkedA : linkedB
  const other = a.kind === 'partner' ? linkedB : linkedA

  return {
    labelFromAToB: partner.relationship === 'Ehe' ? 'angeheiratete Verwandtschaft' : 'familiäre Verbindung über Partnerschaft',
    explanation: `${partner.name} ist ${relationLabel(partner)} von ${linked.name}. ${linked.name} ist zu ${other.name}: ${blood.labelFromAToB}.`,
    path,
    commonAncestor: blood.commonAncestor,
    connectionKind: 'mixed',
  }
}
