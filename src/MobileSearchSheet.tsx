import { useEffect, useMemo, useRef, useState } from 'react'
import { people } from './data'
import { useEdits } from './EditContext'
import { buildFamilyMembers, relationLabel } from './familyGraph'
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

export default function MobileSearchSheet({
  open,
  onClose,
  onSelect,
}: {
  open: boolean
  onClose: () => void
  onSelect: (id: string) => void
}) {
  const { mode } = usePrivacy()
  const { getLifeStatus, getPerson, hasEdit } = useEdits()
  const [query, setQuery] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!open) return
    window.setTimeout(() => inputRef.current?.focus(), 80)
  }, [open])

  const effectivePeople = useMemo(
    () => people.map((person) => getPerson(person.id) ?? person),
    [getPerson],
  )
  const members = useMemo(() => buildFamilyMembers(effectivePeople), [effectivePeople])

  const memberProtected = (member: FamilyMember) => {
    if (mode !== 'protected') return false
    if (member.kind === 'partner') return isPotentiallyLivingRecord(member)
    const person = getPerson(member.id)
    return person ? isProtectedPerson(person, mode, getLifeStatus(member.id)) : true
  }

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('de-CH')
    if (!normalized) return []

    return members
      .filter((member) => {
        const protectedMember = memberProtected(member)
        const searchText = [
          member.name,
          ...(protectedMember ? [] : [member.birth, member.birthPlace, member.death, member.deathPlace]),
        ].filter(Boolean).join(' ').toLocaleLowerCase('de-CH')
        return searchText.includes(normalized)
      })
      .slice(0, 28)
  }, [getLifeStatus, getPerson, members, mode, query])

  const close = () => {
    setQuery('')
    onClose()
  }

  const choose = (member: FamilyMember) => {
    const destination = member.kind === 'partner' ? member.linkedPersonId : member.id
    if (!destination) return
    close()
    onSelect(destination)
  }

  return (
    <section className={`mobile-search-sheet${open ? ' is-open' : ''}`} aria-label="Person suchen" aria-hidden={!open}>
      <div className="mobile-search-header">
        <div>
          <span className="eyebrow">Familienarchiv</span>
          <h2>Person suchen</h2>
        </div>
        <button type="button" className="icon-button" onClick={close} aria-label="Suche schliessen">×</button>
      </div>

      {mode === 'protected' && (
        <div className="mobile-search-privacy">
          <strong>Schutzmodus aktiv</strong>
          <span>Bei geschützten Personen wird nur nach Namen gesucht.</span>
        </div>
      )}

      <div className="mobile-search-input">
        <span aria-hidden="true">⌕</span>
        <input
          ref={inputRef}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={mode === 'protected' ? 'Name eingeben' : 'Name, Ort oder Jahr eingeben'}
          autoComplete="off"
          enterKeyHint="search"
        />
        {query && <button type="button" onClick={() => setQuery('')} aria-label="Eingabe löschen">×</button>}
      </div>

      <div className="mobile-search-body">
        {!query && (
          <div className="mobile-search-empty">
            <strong>{members.length} Personendatensätze</strong>
            <span>{effectivePeople.length} Nachkommen plus {members.length - effectivePeople.length} erfasste Partnerpersonen.</span>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="mobile-search-empty">
            <strong>Keine Person gefunden</strong>
            <span>Prüfe die Schreibweise oder verwende einen kürzeren Suchbegriff.</span>
          </div>
        )}

        {results.map((member) => {
          const protectedMember = memberProtected(member)
          const linked = member.kind === 'partner' && member.linkedPersonId ? getPerson(member.linkedPersonId) : undefined
          const descendant = member.kind === 'descendant' ? getPerson(member.id) : undefined

          return (
            <button type="button" className="mobile-search-result" key={member.id} onClick={() => choose(member)}>
              <span className="mobile-search-result-number">
                {member.kind === 'descendant' ? `#${member.number}` : '∞'}
              </span>
              <span className="mobile-search-result-copy">
                <strong>{member.name}</strong>
                <small>
                  {member.kind === 'descendant'
                    ? `Generation ${member.generation}${hasEdit(member.id) ? ' · lokal korrigiert' : ''}`
                    : `${relationLabel(member)}${linked ? ` von ${linked.name}` : ''}`}
                </small>
                <span className={protectedMember ? 'protected-value' : undefined}>
                  {protectedMember ? 'Lebensdaten geschützt' : member.birth ? formatDate(member.birth) : 'Geburtsdatum offen'}
                  {!protectedMember && member.birthPlace ? ` · ${member.birthPlace}` : ''}
                </span>
                {member.kind === 'partner' && <span className="member-kind-tag">Partnerperson · öffnet Familienfokus</span>}
                {descendant && member.kind === 'descendant' && descendant.name !== member.name ? <span>{descendant.name}</span> : null}
              </span>
              <span className="mobile-search-result-arrow" aria-hidden="true">→</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
