import { useEffect, useMemo, useRef, useState } from 'react'
import { people } from './data'
import { useEdits } from './EditContext'
import { buildFamilyMembers, relationLabel } from './familyGraph'
import type { FamilyMember } from './familyGraph'
import { searchFamilyMembers } from './memberSearch'
import { usePrivacy } from './PrivacyContext'
import { isPotentiallyLivingRecord, isProtectedPerson } from './privacy'

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
  onSelectMember,
}: {
  open: boolean
  onClose: () => void
  onSelectMember: (member: FamilyMember) => void
}) {
  const { mode } = usePrivacy()
  const {
    getLifeStatus,
    getPartnerLifeStatus,
    getPartnerMember,
    getPerson,
    hasEdit,
    hasPartnerEdit,
  } = useEdits()
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
  const members = useMemo(
    () => buildFamilyMembers(effectivePeople).map((member) => (
      member.kind === 'partner' ? getPartnerMember(member.id) ?? member : member
    )),
    [effectivePeople, getPartnerMember],
  )

  const memberProtected = (member: FamilyMember) => {
    if (mode !== 'protected') return false
    if (member.kind === 'partner') {
      return isPotentiallyLivingRecord(member, getPartnerLifeStatus(member.id))
    }
    const person = getPerson(member.id)
    return person ? isProtectedPerson(person, mode, getLifeStatus(member.id)) : true
  }

  const results = useMemo(
    () => searchFamilyMembers(members, query, memberProtected, 28),
    [getLifeStatus, getPartnerLifeStatus, getPerson, members, mode, query],
  )

  const close = () => {
    setQuery('')
    onClose()
  }

  const choose = (member: FamilyMember) => {
    close()
    onSelectMember(member)
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
            <span>{effectivePeople.length} nummerierte Personen plus {members.length - effectivePeople.length} erfasste Partnerpersonen.</span>
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
          const locallyEdited = member.kind === 'partner' ? hasPartnerEdit(member.id) : hasEdit(member.id)

          return (
            <button type="button" className="mobile-search-result" key={member.id} onClick={() => choose(member)}>
              <span className="mobile-search-result-number">
                {member.kind === 'descendant' ? `#${member.number}` : '∞'}
              </span>
              <span className="mobile-search-result-copy">
                <strong>{member.name}</strong>
                <small>
                  {member.kind === 'descendant'
                    ? `Generation ${member.generation}${locallyEdited ? ' · lokal korrigiert' : ''}`
                    : `${relationLabel(member)}${linked ? ` von ${linked.name}` : ''}${locallyEdited ? ' · lokal korrigiert' : ''}`}
                </small>
                <span className={protectedMember ? 'protected-value' : undefined}>
                  {protectedMember ? 'Lebensdaten geschützt' : member.birth ? formatDate(member.birth) : 'Geburtsdatum offen'}
                  {!protectedMember && member.birthPlace ? ` · ${member.birthPlace}` : ''}
                </span>
                {member.kind === 'partner' && <span className="member-kind-tag">Partnerperson · Details öffnen</span>}
              </span>
              <span className="mobile-search-result-arrow" aria-hidden="true">→</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
