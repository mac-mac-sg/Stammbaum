import { readFileSync } from 'node:fs'
import { buildFamilyMembers } from '../src/familyGraph'
import { people } from '../src/data'
import { searchFamilyMembers } from '../src/memberSearch'

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

const members = buildFamilyMembers(people)
const publicSearch = (query: string) => searchFamilyMembers(members, query, () => false, 50)

const michelle = publicSearch('Michelle Herren')
assert(michelle.length === 1, 'Michelle Herren muss genau einmal in der Suche erscheinen.')
assert(michelle[0].kind === 'partner', 'Michelle Herren muss als eigenständige Partnerperson gefunden werden.')
assert(michelle[0].linkedPersonId === 'p095', 'Michelle Herren muss mit Marco Raith verknüpft sein.')
assert(michelle[0].sourceType === 'family', 'Michelle Herren muss als Familienangabe gekennzeichnet sein.')
assert(michelle[0].sourceDate === '2026-09-10', 'Die Herkunftsdatierung von Michelle Herren fehlt.')

assert(publicSearch('Thomas Korsch').length === 0, 'Thomas Korsch darf nicht mehr im Familiengraph vorhanden sein.')

const app = readFileSync(new URL('../src/App.tsx', import.meta.url), 'utf8')
const mobileSearch = readFileSync(new URL('../src/MobileSearchSheet.tsx', import.meta.url), 'utf8')
const settings = readFileSync(new URL('../src/SettingsMenu.tsx', import.meta.url), 'utf8')
const relationship = readFileSync(new URL('../src/RelationshipFinder.tsx', import.meta.url), 'utf8')
const uxCss = readFileSync(new URL('../src/ux-simplification.css', import.meta.url), 'utf8')
const manifest = readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8')

for (const label of ['<small>Start</small>', '<small>Suche</small>', '<small>Familie</small>']) {
  assert(app.includes(label), `Mobile Navigation muss ${label} enthalten.`)
}
assert(!app.includes('<small>Person</small>'), 'Der redundante mobile Navigationspunkt Person muss entfernt bleiben.')
assert(mobileSearch.includes('onSelectMember(member)'), 'Partner-Suchergebnisse müssen direkt als FamilyMember geöffnet werden.')
assert(uxCss.includes('.toolbar .search-wrap') && uxCss.includes('display: none'), 'Die doppelte mobile Suche muss in der Familienansicht verborgen bleiben.')
assert((relationship.match(/Andere Person vergleichen/g) ?? []).length >= 2, 'Der Verwandtschafts-Finder braucht auch nach einem Fehlschlag einen Rückweg.')
assert(settings.includes('technisch öffentlich abrufbar'), 'Die Datenschutzeinstellung muss den öffentlichen Bereitstellungscharakter erklären.')
assert(!manifest.includes('Privates Familienarchiv'), 'Das Manifest darf die öffentliche App nicht als privat bezeichnen.')

console.log(`UX-Prüfung erfolgreich: ${people.length} nummerierte Personen, ${members.length - people.length} Partnerpersonen.`)
