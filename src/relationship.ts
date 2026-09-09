import { peopleById } from './data'
import type { Person } from './types'

export interface RelationshipResult {
  commonAncestor: Person
  distanceFromA: number
  distanceFromB: number
  labelFromAToB: string
  explanation: string
  path: Person[]
}

function pathToRoot(personId: string) {
  const path: Person[] = []
  let current = peopleById[personId]
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
    if (pathA[index].id !== pathB[index].id) break
    commonIndex = index
  }

  if (commonIndex < 0) return null

  const commonAncestor = pathA[commonIndex]
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
