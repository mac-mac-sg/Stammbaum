import { useMemo, useState } from 'react'
import { people } from './data'
import { getRelationship } from './relationship'
import type { Person } from './types'

function searchable(person: Person) {
  return [
    person.name,
    person.birth,
    person.birthPlace,
    person.death,
    person.deathPlace,
  ].filter(Boolean).join(' ').toLocaleLowerCase('de-CH')
}

export default function RelationshipFinder({
  person,
  open,
  onClose,
  onNavigate,
}: {
  person: Person
  open: boolean
  onClose: () => void
  onNavigate: (id: string) => void
}) {
  const [query, setQuery] = useState('')
  const [targetId, setTargetId] = useState<string | null>(null)

  const target = targetId ? people.find((candidate) => candidate.id === targetId) : undefined
  const result = target ? getRelationship(person, target) : null

  const matches = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('de-CH')
    if (!normalized) return []
    return people
      .filter((candidate) => candidate.id !== person.id && searchable(candidate).includes(normalized))
      .slice(0, 8)
  }, [person.id, query])

  const chooseTarget = (candidate: Person) => {
    setTargetId(candidate.id)
    setQuery('')
  }

  const close = () => {
    setQuery('')
    setTargetId(null)
    onClose()
  }

  return (
    <>
      <button
        type="button"
        className={`relationship-backdrop${open ? ' is-open' : ''}`}
        aria-label="Verwandtschafts-Finder schliessen"
        onClick={close}
      />
      <aside className={`relationship-sheet${open ? ' is-open' : ''}`} aria-label="Verwandtschaft finden">
        <div className="sheet-handle" aria-hidden="true" />
        <div className="relationship-header">
          <div>
            <span className="eyebrow">Verwandtschafts-Finder</span>
            <h2>Wie seid ihr verwandt?</h2>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Schliessen">×</button>
        </div>

        <div className="relationship-origin">
          <span>Ausgangspunkt</span>
          <strong>{person.name}</strong>
        </div>

        {!target && (
          <div className="relationship-search-wrap">
            <label htmlFor="relationship-search">Zweite Person suchen</label>
            <input
              id="relationship-search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Name, Ort oder Jahr"
              autoComplete="off"
              enterKeyHint="search"
            />
            {query && (
              <div className="relationship-search-results">
                {matches.length > 0 ? matches.map((candidate) => (
                  <button type="button" key={candidate.id} onClick={() => chooseTarget(candidate)}>
                    <strong>{candidate.name}</strong>
                    <span>#{candidate.number} · Generation {candidate.generation}</span>
                  </button>
                )) : <p>Keine passende Person gefunden.</p>}
              </div>
            )}
          </div>
        )}

        {target && result && (
          <div className="relationship-result">
            <div className="relationship-pair">
              <div>
                <span>Person A</span>
                <strong>{person.name}</strong>
              </div>
              <span aria-hidden="true">↔</span>
              <div>
                <span>Person B</span>
                <strong>{target.name}</strong>
              </div>
            </div>

            <div className="relationship-answer">
              <span>Beziehung</span>
              <strong>{result.labelFromAToB}</strong>
              <p>{result.explanation}</p>
            </div>

            <div className="relationship-path">
              <span>Verbindung im erfassten Stammbaum</span>
              <div>
                {result.path.map((pathPerson, index) => (
                  <span key={pathPerson.id}>
                    {index > 0 && <i aria-hidden="true">→</i>}
                    <button type="button" onClick={() => {
                      close()
                      onNavigate(pathPerson.id)
                    }}>
                      {pathPerson.name}
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button type="button" className="relationship-reset" onClick={() => setTargetId(null)}>
              Andere Person vergleichen
            </button>
          </div>
        )}

        {target && !result && (
          <div className="relationship-empty">
            Für diese beiden Personen konnte auf Basis der erfassten Eltern-Kind-Verknüpfungen keine Verbindung berechnet werden.
          </div>
        )}

        <p className="relationship-note">
          Berechnet werden nur die strukturierten Abstammungsverbindungen aus den vorhandenen Familienunterlagen. Ehe- und Lebenspartner sind aktuell nicht als eigenständige Personen im Beziehungsgraphen verknüpft.
        </p>
      </aside>
    </>
  )
}
