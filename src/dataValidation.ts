import { buildFamilyMembers, partnerMemberId } from './familyGraph'
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

  const familyMembers = buildFamilyMembers(people)
  const familyMemberIds = new Set<string>()
  for (const member of familyMembers) {
    if (familyMemberIds.has(member.id)) errors.push(`Doppelte Familiengraph-ID: ${member.id}.`)
    familyMemberIds.add(member.id)

    if (!member.name.trim()) errors.push(`Familiengraph-Knoten ${member.id} hat keinen Namen.`)

    if (member.kind === 'partner') {
      if (!member.linkedPersonId || !peopleById[member.linkedPersonId]) {
        errors.push(`Partnerknoten ${member.id} verweist auf keine gültige Stammbaum-Person.`)
        continue
      }

      const linked = peopleById[member.linkedPersonId]
      const partnerIndex = member.partnerIndex
      if (partnerIndex === undefined || !linked.partners[partnerIndex]) {
        errors.push(`Partnerknoten ${member.id} hat keinen gültigen Partnerindex.`)
        continue
      }

      const sourcePartner = linked.partners[partnerIndex]
      if (member.id !== partnerMemberId(linked.id, partnerIndex)) {
        errors.push(`Partnerknoten ${member.id} verwendet keine stabile erwartete ID.`)
      }
      if (member.name !== sourcePartner.name) {
        errors.push(`Partnerknoten ${member.id} stimmt beim Namen nicht mit dem Quelldatensatz überein.`)
      }
      if (member.relationship !== sourcePartner.relationship) {
        errors.push(`Partnerknoten ${member.id} stimmt beim Beziehungstyp nicht mit dem Quelldatensatz überein.`)
      }
      if (member.generation !== linked.generation) {
        errors.push(`Partnerknoten ${member.id} muss für die Darstellung Generation ${linked.generation} zugeordnet sein.`)
      }
    }
  }

  const expectedMemberCount = people.length + people.reduce((sum, person) => sum + person.partners.length, 0)
  if (familyMembers.length !== expectedMemberCount) {
    errors.push(`Familiengraph enthält ${familyMembers.length} statt erwarteter ${expectedMemberCount} Personenknoten.`)
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
