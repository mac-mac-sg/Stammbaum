import { useMemo } from 'react'
import { people } from './data'
import { useEdits } from './EditContext'
import { useFamilyNavigation } from './FamilyNavigationContext'
import { familyMembersById, relationLabel } from './familyGraph'
import type { FamilyMember } from './familyGraph'
import { usePrivacy } from './PrivacyContext'
import { isPotentiallyLivingRecord, isProtectedPerson } from './privacy'
import type { Person } from './types'

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function formatDate(value?: string) {
  if (!value) return 'Datum offen'
  if (/^\d{4}$/.test(value)) return value
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return `${day}. ${monthNames[month - 1]} ${year}`
}

export default function HomeView({
  selectedPerson,
  onOpenPerson,
  onOpenPartner,
  onOpenSearch,
}: {
  selectedPerson: Person
  onOpenPerson: (id: string) => void
  onOpenPartner: (member: FamilyMember) => void
  onOpenSearch: () => void
}) {
  const { mode } = usePrivacy()
  const {
    getLifeStatus,
    getPartnerLifeStatus,
    getPartnerMember,
    getPerson,
  } = useEdits()
  const {
    clearRecent,
    favoriteIds,
    isFavorite,
    recentIds,
    toggleFavorite,
  } = useFamilyNavigation()

  const resolveMember = (id: string): FamilyMember | undefined => {
    const base = familyMembersById[id]
    if (!base) return undefined
    if (base.kind === 'partner') return getPartnerMember(id) ?? base
    const person = getPerson(id)
    if (!person) return undefined
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

  const favorites = useMemo(
    () => favoriteIds.map(resolveMember).filter((member): member is FamilyMember => Boolean(member)),
    [favoriteIds, getPartnerMember, getPerson],
  )

  const recents = useMemo(
    () => recentIds.map(resolveMember).filter((member): member is FamilyMember => Boolean(member)).slice(0, 8),
    [getPartnerMember, getPerson, recentIds],
  )

  const protectedSelected = isProtectedPerson(selectedPerson, mode, getLifeStatus(selectedPerson.id))

  const memberProtected = (member: FamilyMember) => {
    if (mode !== 'protected') return false
    if (member.kind === 'partner') {
      return isPotentiallyLivingRecord(member, getPartnerLifeStatus(member.id))
    }
    const person = getPerson(member.id)
    return person ? isProtectedPerson(person, mode, getLifeStatus(person.id)) : true
  }

  const openMember = (member: FamilyMember) => {
    if (member.kind === 'partner') onOpenPartner(member)
    else onOpenPerson(member.id)
  }

  const renderMember = (member: FamilyMember) => {
    const protectedMember = memberProtected(member)
    return (
      <article className="home-person-card" key={member.id}>
        <button type="button" className="home-person-main" onClick={() => openMember(member)}>
          <span className="home-person-meta">
            {member.kind === 'descendant'
              ? `#${member.number} · Generation ${member.generation}`
              : relationLabel(member)}
          </span>
          <strong>{member.name}</strong>
          <span className={protectedMember ? 'protected-value' : undefined}>
            {protectedMember
              ? 'Lebensdaten geschützt'
              : member.birth
                ? `* ${formatDate(member.birth)}`
                : member.birthPlace ?? 'Lebensdaten offen'}
          </span>
        </button>
        <button
          type="button"
          className={`home-favorite${isFavorite(member.id) ? ' is-active' : ''}`}
          onClick={() => toggleFavorite(member.id)}
          aria-label={isFavorite(member.id) ? `${member.name} aus Favoriten entfernen` : `${member.name} zu Favoriten hinzufügen`}
          title={isFavorite(member.id) ? 'Favorit entfernen' : 'Als Favorit speichern'}
        >
          {isFavorite(member.id) ? '★' : '☆'}
        </button>
      </article>
    )
  }

  return (
    <div className="home-view" aria-label="Startseite">
      <div className="home-intro">
        <span className="eyebrow">Familienarchiv</span>
        <h2>Familie entdecken</h2>
        <p>Suche eine Person oder setze dort fort, wo du zuletzt warst.</p>
      </div>

      <button type="button" className="home-search" onClick={onOpenSearch}>
        <span aria-hidden="true">⌕</span>
        <span><strong>Person suchen</strong><small>{people.length} nummerierte Personen plus erfasste Partner</small></span>
        <b aria-hidden="true">→</b>
      </button>

      <section className="home-current home-current-simple">
        <span>Weiter bei</span>
        <strong>{selectedPerson.name}</strong>
        <small className={protectedSelected ? 'protected-value' : undefined}>
          {protectedSelected
            ? 'Lebensdaten geschützt'
            : selectedPerson.birth
              ? `* ${formatDate(selectedPerson.birth)}`
              : `Generation ${selectedPerson.generation}`}
        </small>
        <button type="button" className="home-primary-action" onClick={() => onOpenPerson(selectedPerson.id)}>
          Familie öffnen <span aria-hidden="true">→</span>
        </button>
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">Schnellzugriff</span>
            <h3>Favoriten</h3>
          </div>
          <span>{favorites.length}</span>
        </div>
        {favorites.length > 0 ? (
          <div className="home-card-list">{favorites.map(renderMember)}</div>
        ) : (
          <div className="home-empty-card">
            <strong>Noch keine Favoriten</strong>
            <span>Öffne eine Person und tippe auf den Stern, um sie hier abzulegen.</span>
          </div>
        )}
      </section>

      <section className="home-section">
        <div className="home-section-heading">
          <div>
            <span className="eyebrow">Verlauf</span>
            <h3>Zuletzt angesehen</h3>
          </div>
          {recents.length > 0 && <button type="button" onClick={clearRecent}>Leeren</button>}
        </div>
        {recents.length > 0 ? (
          <div className="home-card-list">{recents.map(renderMember)}</div>
        ) : (
          <div className="home-empty-card compact">
            <span>Besuchte Personen erscheinen automatisch hier.</span>
          </div>
        )}
      </section>
    </div>
  )
}
