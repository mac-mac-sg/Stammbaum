import { useEffect, useMemo, useRef, useState } from 'react'
import { people } from './data'
import { useEdits } from './EditContext'
import { usePrivacy } from './PrivacyContext'
import { isProtectedPartner, isProtectedPerson, protectedSearchParts } from './privacy'
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

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('de-CH')
    if (!normalized) return []

    return effectivePeople
      .filter((person) => {
        const partnerParts = person.partners.flatMap((partner) => {
          if (isProtectedPartner(partner, mode)) return [partner.name]
          return [partner.name, partner.birth, partner.birthPlace, partner.death, partner.deathPlace]
        })
        const searchText = [
          person.name,
          ...protectedSearchParts(person, mode, getLifeStatus(person.id)),
          ...partnerParts,
        ].filter(Boolean).join(' ').toLocaleLowerCase('de-CH')
        return searchText.includes(normalized)
      })
      .slice(0, 24)
  }, [effectivePeople, getLifeStatus, mode, query])

  const close = () => {
    setQuery('')
    onClose()
  }

  const choose = (id: string) => {
    close()
    onSelect(id)
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
            <strong>{effectivePeople.length} Personen</strong>
            <span>Suche nach einer Person und springe direkt in ihren Familienfokus.</span>
          </div>
        )}

        {query && results.length === 0 && (
          <div className="mobile-search-empty">
            <strong>Keine Person gefunden</strong>
            <span>Prüfe die Schreibweise oder verwende einen kürzeren Suchbegriff.</span>
          </div>
        )}

        {results.map((person: Person) => {
          const protectedPerson = isProtectedPerson(person, mode, getLifeStatus(person.id))
          return (
            <button type="button" className="mobile-search-result" key={person.id} onClick={() => choose(person.id)}>
              <span className="mobile-search-result-number">#{person.number}</span>
              <span className="mobile-search-result-copy">
                <strong>{person.name}</strong>
                <small>Generation {person.generation}{hasEdit(person.id) ? ' · lokal korrigiert' : ''}</small>
                <span className={protectedPerson ? 'protected-value' : undefined}>
                  {protectedPerson ? 'Lebensdaten geschützt' : person.birth ? formatDate(person.birth) : 'Geburtsdatum offen'}
                  {!protectedPerson && person.birthPlace ? ` · ${person.birthPlace}` : ''}
                </span>
              </span>
              <span className="mobile-search-result-arrow" aria-hidden="true">→</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
