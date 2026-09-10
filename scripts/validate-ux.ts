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
const main = readFileSync(new URL('../src/main.tsx', import.meta.url), 'utf8')
const home = readFileSync(new URL('../src/HomeView.tsx', import.meta.url), 'utf8')
const homeCss = readFileSync(new URL('../src/home.css', import.meta.url), 'utf8')
const mobileSearch = readFileSync(new URL('../src/MobileSearchSheet.tsx', import.meta.url), 'utf8')
const mobileSearchCss = readFileSync(new URL('../src/mobile-search.css', import.meta.url), 'utf8')
const settings = readFileSync(new URL('../src/SettingsMenu.tsx', import.meta.url), 'utf8')
const relationship = readFileSync(new URL('../src/RelationshipFinder.tsx', import.meta.url), 'utf8')
const uxCss = readFileSync(new URL('../src/ux-simplification.css', import.meta.url), 'utf8')
const designCss = readFileSync(new URL('../src/design-polish.css', import.meta.url), 'utf8')
const manifest = readFileSync(new URL('../public/manifest.webmanifest', import.meta.url), 'utf8')

for (const label of ['<small>Start</small>', '<small>Suche</small>', '<small>Stammbaum</small>']) {
  assert(app.includes(label), `Mobile Navigation muss ${label} enthalten.`)
}
assert(!app.includes('<small>Person</small>'), 'Der redundante mobile Navigationspunkt Person muss entfernt bleiben.')
assert(!app.includes('<small>Familie</small>'), 'Der Haupttab muss den neutralen Stammbaum und nicht den Personenfokus öffnen.')
assert(app.includes('onClick={openWholeTree}') && app.includes('<small>Stammbaum</small>'), 'Der Stammbaum-Tab muss den neutralen Gesamtbaum öffnen.')
assert(home.includes('Stammbaum entdecken'), 'Die Startseite muss den Stammbaum und nicht eine einzelne Person ins Zentrum stellen.')
assert(home.includes('Gesamtbaum öffnen'), 'Die Startseite braucht einen direkten Einstieg in den Gesamtbaum.')
assert(!home.includes('Weiter bei'), 'Die Startseite darf nicht mehr mit einer zuletzt gewählten Person beginnen.')
assert(app.includes('onOpenTree={openWholeTree}'), 'Der Gesamtbaum-Einstieg muss sauber über die App-Navigation verdrahtet sein.')
assert(app.includes('setTreeOverview(true)'), 'Der Gesamtbaum-Einstieg muss ohne Personenfokus starten.')
assert(app.includes("selectedId={treeOverview ? '' : selectedId}"), 'Im neutralen Gesamtbaum darf keine Person vorausgewählt sein.')
assert(app.includes('zoomToElement?.(`person-${id}`, scale, 240)'), 'Wiederholte Baumfokussierung muss kurz und responsiv bleiben.')
assert(app.includes('<SettingsMenu />'), 'Die Einstellungen müssen als echte Header-Aktion innerhalb der App gerendert werden.')
assert(!main.includes('<SettingsMenu />'), 'Das Einstellungsmenü darf nicht mehr als frei schwebendes Root-Geschwister gerendert werden.')
assert(homeCss.includes('.home-discovery') && homeCss.includes('.home-tree-action'), 'Die tree-first Startseite braucht ihre eigene visuelle Hierarchie.')
assert(homeCss.includes('prefers-reduced-motion'), 'Bewegung auf der Startseite muss reduzierte Bewegung respektieren.')
assert(mobileSearch.includes('onSelectMember(member)'), 'Partner-Suchergebnisse müssen direkt als FamilyMember geöffnet werden.')
assert(uxCss.includes('.toolbar .search-wrap') && uxCss.includes('display: none'), 'Die doppelte mobile Suche muss in der Familienansicht verborgen bleiben.')
assert(uxCss.includes('backdrop-filter: blur(20px) saturate(160%)'), 'Die mobile Navigation muss den Glass-Effekt behalten.')
assert(uxCss.includes('--mobile-nav-glass') && uxCss.includes('--mobile-nav-glass-shadow'), 'Die Glass-Navigation braucht themefähige Flächen- und Schattenvariablen.')
assert(mobileSearchCss.includes('top: var(--mobile-header)'), 'Die mobile Suche muss unterhalb der App-Kopfzeile beginnen.')
assert(mobileSearchCss.includes('bottom: calc(var(--mobile-nav) + env(safe-area-inset-bottom))'), 'Die mobile Suche muss oberhalb der Bottom Navigation enden.')
assert(mobileSearchCss.includes('z-index: 70'), 'Die mobile Suche muss unter der Bottom Navigation liegen.')
assert(mobileSearchCss.includes('.mobile-search-header > .icon-button') && mobileSearchCss.includes('display: none'), 'Die mobile Suche darf keinen Schliessen-Knopf mit dem Einstellungsmenü überlagern.')
assert(settings.includes('<svg') && !settings.includes('>⚙<'), 'Das Einstellungsicon muss plattformunabhängig als SVG gerendert werden.')
assert(settings.includes('settings-panel${open ? \' is-open\' : \'\'}'), 'Das Settings-Popover muss einen animierbaren Open-State besitzen.')
assert(designCss.includes('--ease-out: cubic-bezier(.23, 1, .32, 1)'), 'Die App braucht eine gemeinsame starke Ease-out-Kurve.')
assert(designCss.includes('transform-origin: top right'), 'Das Einstellungs-Popover muss vom auslösenden Header-Button materialisieren.')
assert(designCss.includes('prefers-reduced-transparency'), 'Glass-Flächen brauchen einen Fallback für reduzierte Transparenz.')
assert(designCss.includes('prefers-contrast: more'), 'Glass-Flächen brauchen einen Fallback für erhöhten Kontrast.')
assert(designCss.includes('prefers-reduced-motion'), 'Interaktionspolish muss reduzierte Bewegung appweit respektieren.')
assert((relationship.match(/Andere Person vergleichen/g) ?? []).length >= 2, 'Der Verwandtschafts-Finder braucht auch nach einem Fehlschlag einen Rückweg.')
assert(settings.includes('technisch öffentlich abrufbar'), 'Die Datenschutzeinstellung muss den öffentlichen Bereitstellungscharakter erklären.')
assert(!manifest.includes('Privates Familienarchiv'), 'Das Manifest darf die öffentliche App nicht als privat bezeichnen.')

console.log(`UX-Prüfung erfolgreich: ${people.length} nummerierte Personen, ${members.length - people.length} Partnerpersonen.`)
