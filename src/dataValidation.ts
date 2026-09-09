import type { Person } from './types'

export interface GenealogyValidationResult {
  errors: string[]
  warnings: string[]
}

export function validateGenealogy(
  people: Person[],
  peopleById: Record<string, Person>,
  rootId: string,
): GenealogyValidationResult {
  const errors: string[] = []
  const warnings: string[] = []
  const ids = new Set<string>()
  const numbers = new Set<number>()

  if (!peopleById[rootId]) errors.push(`Root-Person ${rootId} fehlt.`)

  for (const person of people) {
    if (ids.has(person.id)) errors.push(`Doppelte Personen-ID: ${person.id}.`)
    ids.add(person.id)

    if (numbers.has(person.number)) errors.push(`Doppelte Quellennummer: #${person.number}.`)
    numbers.add(person.number)

    if (peopleById[person.id] !== person) {
      errors.push(`peopleById verweist für ${person.id} nicht auf denselben Datensatz.`)
    }

    if (!person.name.trim()) errors.push(`Person ${person.id} hat keinen Namen.`)
    if (!person.birth) warnings.push(`${person.name} (#${person.number}) hat kein vollständiges Geburtsdatum.`)

    if (person.parentId) {
      const parent = peopleById[person.parentId]
      if (!parent) {
        errors.push(`${person.name} verweist auf fehlenden Elternknoten ${person.parentId}.`)
      } else {
        if (!parent.childIds.includes(person.id)) {
          errors.push(`${person.name} nennt ${parent.name} als Elternlinie, ist dort aber nicht als Kind verknüpft.`)
        }
        if (person.generation !== parent.generation + 1) {
          errors.push(`Generationssprung zwischen ${parent.name} (G${parent.generation}) und ${person.name} (G${person.generation}).`)
        }
      }
    } else if (person.id !== rootId) {
      warnings.push(`${person.name} (#${person.number}) hat keine Elternverknüpfung.`)
    }

    for (const childId of person.childIds) {
      if (childId === person.id) errors.push(`${person.name} ist als eigenes Kind verknüpft.`)
      const child = peopleById[childId]
      if (!child) {
        errors.push(`${person.name} verweist auf fehlendes Kind ${childId}.`)
        continue
      }
      if (child.parentId !== person.id) {
        errors.push(`Kindverknüpfung ${person.name} → ${child.name} ist nicht bidirektional konsistent.`)
      }
    }
  }

  for (const person of people) {
    const visited = new Set<string>()
    let current: Person | undefined = person
    while (current) {
      if (visited.has(current.id)) {
        errors.push(`Zyklus in der Elternlinie bei ${person.name}.`)
        break
      }
      visited.add(current.id)
      current = current.parentId ? peopleById[current.parentId] : undefined
    }
  }

  return { errors, warnings }
}

export function assertValidGenealogy(
  people: Person[],
  peopleById: Record<string, Person>,
  rootId: string,
) {
  const result = validateGenealogy(people, peopleById, rootId)

  if (result.warnings.length > 0) {
    console.info(`Stammbaum-Datenprüfung: ${result.warnings.length} Hinweis(e).`, result.warnings)
  }

  if (result.errors.length > 0) {
    throw new Error(`Stammbaum-Daten sind inkonsistent:\n${result.errors.join('\n')}`)
  }
}
