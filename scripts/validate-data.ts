import { people, peopleById, rootId } from '../src/data'
import { buildFamilyMembers } from '../src/familyGraph'
import { validateGenealogy } from '../src/dataValidation'

const result = validateGenealogy(people, peopleById, rootId)
const familyMembers = buildFamilyMembers(people)
const partnerCount = familyMembers.filter((member) => member.kind === 'partner').length

if (result.warnings.length > 0) {
  console.log(`Datenprüfung: ${result.warnings.length} Hinweis(e).`)
  for (const warning of result.warnings) console.log(`  - ${warning}`)
}

if (result.errors.length > 0) {
  console.error(`Datenprüfung fehlgeschlagen: ${result.errors.length} Fehler.`)
  for (const error of result.errors) console.error(`  - ${error}`)
  process.exit(1)
}

console.log(
  `Datenprüfung erfolgreich: ${people.length} nummerierte Nachkommen, ${partnerCount} Partnerpersonen, ${familyMembers.length} Personenknoten, ${new Set(people.map((person) => person.number)).size} eindeutige Quellennummern.`,
)
