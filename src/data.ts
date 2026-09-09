import type { Person } from './types'
import { people1to23 } from './data/people-1-23'
import { people24to48 } from './data/people-24-48'
import { people49to72 } from './data/people-49-72'
import { people73to89 } from './data/people-73-89'
import { people90to104 } from './data/people-90-104'

export const rootId = 'p001'

export const people: Person[] = [
  ...people1to23,
  ...people24to48,
  ...people49to72,
  ...people73to89,
  ...people90to104,
]

export const peopleById = Object.fromEntries(
  people.map((person) => [person.id, person]),
) as Record<string, Person>
