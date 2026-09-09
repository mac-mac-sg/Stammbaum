import { useMemo, useRef, useState } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import { people, peopleById, rootId } from './data'
import type { Person } from './types'

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function formatDate(value?: string) {
  if (!value) return 'unbekannt'
  if (/^\d{4}$/.test(value)) return value
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return `${day}. ${monthNames[month - 1]} ${year}`
}

function lifeLabel(person: Person) {
  const birth = person.birth ? formatDate(person.birth) : '?'
  const death = person.death ? formatDate(person.death) : ''
  return death ? `${birth} – ${death}` : `* ${birth}`
}

function searchText(person: Person) {
  return [
    person.name,
    person.birth,
    person.birthPlace,
    person.death,
    person.deathPlace,
    ...person.partners.flatMap((partner) => [
      partner.name,
      partner.birth,
      partner.birthPlace,
      partner.death,
      partner.deathPlace,
    ]),
  ].filter(Boolean).join(' ').toLocaleLowerCase('de-CH')
}

function getPathToRoot(personId: string) {
  const path: string[] = []
  let current: Person | undefined = peopleById[personId]
  while (current) {
    path.unshift(current.id)
    current = current.parentId ? peopleById[current.parentId] : undefined
  }
  return path
}

function PersonCard({
  person,
  selected,
  onSelect,
  inPath,
}: {
  person: Person
  selected: boolean
  onSelect: (id: string) => void
  inPath: boolean
}) {
  const partner = person.partners[0]
  return (
    <button
      id={`person-${person.id}`}
      className={`person-card${selected ? ' is-selected' : ''}${inPath ? ' is-path' : ''}`}
      onClick={() => onSelect(person.id)}
      type="button"
    >
      <span className="source-number">{person.number}</span>
      <span className="person-name">{person.name}</span>
      <span className="person-life">{lifeLabel(person)}</span>
      {partner && (
        <span className="partner-line">
          <span aria-hidden="true">∞</span>
          <span>{partner.name}</span>
        </span>
      )}
      {person.partners.length > 1 && (
        <span className="partner-count">+ {person.partners.length - 1} weitere Beziehung</span>
      )}
    </button>
  )
}

function TreeNode({
  personId,
  depthLimit,
  selectedId,
  pathIds,
  onSelect,
}: {
  personId: string
  depthLimit: number
  selectedId: string
  pathIds: Set<string>
  onSelect: (id: string) => void
}) {
  const person = peopleById[personId]
  if (!person) return null

  const visibleChildren =
    person.generation < depthLimit
      ? person.childIds.filter((childId) => peopleById[childId])
      : []

  return (
    <li>
      <PersonCard
        person={person}
        selected={person.id === selectedId}
        onSelect={onSelect}
        inPath={pathIds.has(person.id)}
      />
      {visibleChildren.length > 0 && (
        <ul>
          {visibleChildren.map((childId) => (
            <TreeNode
              key={childId}
              personId={childId}
              depthLimit={depthLimit}
              selectedId={selectedId}
              pathIds={pathIds}
              onSelect={onSelect}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

function DetailPanel({
  person,
  onClose,
  onSelect,
}: {
  person: Person
  onClose: () => void
  onSelect: (id: string) => void
}) {
  const parent = person.parentId ? peopleById[person.parentId] : undefined
  const children = person.childIds.map((id) => peopleById[id]).filter(Boolean)
  const path = getPathToRoot(person.id).map((id) => peopleById[id])

  return (
    <aside className="detail-panel" aria-label={`Details zu ${person.name}`}>
      <div className="detail-topbar">
        <div>
          <span className="eyebrow">Person #{person.number} · Generation {person.generation}</span>
          <h2>{person.name}</h2>
        </div>
        <button className="icon-button" type="button" onClick={onClose} aria-label="Details schliessen">
          ×
        </button>
      </div>

      <section className="detail-section">
        <h3>Lebensdaten</h3>
        <dl className="facts">
          <div>
            <dt>Geburt</dt>
            <dd>{person.birth ? formatDate(person.birth) : 'nicht angegeben'}</dd>
          </div>
          <div>
            <dt>Geburtsort</dt>
            <dd>{person.birthPlace ?? 'nicht angegeben'}</dd>
          </div>
          <div>
            <dt>Tod</dt>
            <dd>{person.death ? formatDate(person.death) : 'kein Sterbedatum in der Quelle'}</dd>
          </div>
          <div>
            <dt>Sterbeort</dt>
            <dd>{person.deathPlace ?? 'nicht angegeben'}</dd>
          </div>
        </dl>
      </section>

      {person.partners.length > 0 && (
        <section className="detail-section">
          <h3>Beziehungen</h3>
          <div className="relationship-list">
            {person.partners.map((partner, index) => (
              <article className="relationship-card" key={`${partner.name}-${index}`}>
                <strong>{partner.name}</strong>
                <span>{partner.relationship}{partner.status ? ` · ${partner.status}` : ''}</span>
                {(partner.birth || partner.birthPlace) && (
                  <span>
                    Geboren {partner.birth ? formatDate(partner.birth) : 'Datum unbekannt'}
                    {partner.birthPlace ? ` · ${partner.birthPlace}` : ''}
                  </span>
                )}
                {(partner.death || partner.deathPlace) && (
                  <span>
                    Gestorben {partner.death ? formatDate(partner.death) : 'Datum unbekannt'}
                    {partner.deathPlace ? ` · ${partner.deathPlace}` : ''}
                  </span>
                )}
                {partner.notes && <span className="uncertain-note">{partner.notes}</span>}
              </article>
            ))}
          </div>
        </section>
      )}

      <section className="detail-section">
        <h3>Familie</h3>
        <div className="family-links">
          {parent && (
            <button type="button" onClick={() => onSelect(parent.id)}>
              <span>Elternlinie</span>
              <strong>← {parent.name}</strong>
            </button>
          )}
          {children.map((child) => (
            <button type="button" key={child.id} onClick={() => onSelect(child.id)}>
              <span>Kind</span>
              <strong>{child.name} →</strong>
            </button>
          ))}
          {!parent && children.length === 0 && <span>Keine Familienverknüpfungen erfasst.</span>}
        </div>
      </section>

      <section className="detail-section">
        <h3>Linie zu Sebastian Villiger</h3>
        <div className="lineage">
          {path.map((pathPerson, index) => (
            <span key={pathPerson.id}>
              {index > 0 && <b>→</b>}
              <button type="button" onClick={() => onSelect(pathPerson.id)}>
                {pathPerson.name}
              </button>
            </span>
          ))}
        </div>
      </section>

      {(person.notes || person.source) && (
        <section className="detail-section source-section">
          <h3>Quelle & Datenqualität</h3>
          <p>Nachkommen von Sebastian Villiger, Seite {person.source} von 9.</p>
          {person.notes && <p className="uncertain-note">{person.notes}</p>}
          <p className="source-hint">
            Angaben wurden aus den bereitgestellten Scans übertragen. Unklare oder unvollständige
            Stellen werden ausdrücklich nicht ergänzt.
          </p>
        </section>
      )}
    </aside>
  )
}

export default function App() {
  const [selectedId, setSelectedId] = useState('p095')
  const [query, setQuery] = useState('')
  const [depthLimit, setDepthLimit] = useState(5)
  const zoomRef = useRef<any>(null)

  const selectedPerson = peopleById[selectedId] ?? peopleById[rootId]
  const pathIds = useMemo(() => new Set(getPathToRoot(selectedPerson.id)), [selectedPerson.id])

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('de-CH')
    if (!normalized) return []
    return people
      .filter((person) => searchText(person).includes(normalized))
      .slice(0, 10)
  }, [query])

  const selectPerson = (id: string, focus = false) => {
    const person = peopleById[id]
    if (!person) return
    setSelectedId(id)
    if (person.generation > depthLimit) setDepthLimit(person.generation)
    setQuery('')
    if (focus) {
      window.setTimeout(() => {
        zoomRef.current?.zoomToElement?.(`person-${id}`, 0.9, 500)
      }, 80)
    }
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true">
            <span />
            <span />
            <span />
          </div>
          <div>
            <span className="eyebrow">Familienarchiv</span>
            <h1>Stammbaum Villiger</h1>
          </div>
        </div>

        <div className="header-stats" aria-label="Datenbestand">
          <div>
            <strong>{people.length}</strong>
            <span>Nachkommen</span>
          </div>
          <div>
            <strong>5</strong>
            <span>Generationen</span>
          </div>
          <div>
            <strong>{people.reduce((sum, p) => sum + p.partners.length, 0)}</strong>
            <span>Beziehungen</span>
          </div>
        </div>
      </header>

      <main className="main-layout">
        <section className="tree-area">
          <div className="toolbar">
            <div className="search-wrap">
              <label htmlFor="family-search">Person suchen</label>
              <div className="search-box">
                <span aria-hidden="true">⌕</span>
                <input
                  id="family-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Name, Ort oder Jahr"
                  autoComplete="off"
                />
                {query && (
                  <button type="button" onClick={() => setQuery('')} aria-label="Suche leeren">×</button>
                )}
              </div>
              {results.length > 0 && (
                <div className="search-results">
                  {results.map((person) => (
                    <button type="button" key={person.id} onClick={() => selectPerson(person.id, true)}>
                      <span>
                        <strong>{person.name}</strong>
                        <small>#{person.number} · Generation {person.generation}</small>
                      </span>
                      <span>{person.birth ? formatDate(person.birth) : 'Datum offen'}</span>
                    </button>
                  ))}
                </div>
              )}
              {query && results.length === 0 && (
                <div className="search-results empty">Keine passende Person gefunden.</div>
              )}
            </div>

            <div className="depth-control">
              <span>Baumtiefe</span>
              <div className="segmented">
                {[2, 3, 4, 5].map((depth) => (
                  <button
                    type="button"
                    key={depth}
                    className={depthLimit === depth ? 'active' : ''}
                    onClick={() => setDepthLimit(depth)}
                  >
                    {depth}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="canvas-frame">
            <TransformWrapper
              ref={zoomRef}
              initialScale={0.38}
              minScale={0.18}
              maxScale={1.5}
              centerOnInit
              limitToBounds={false}
              wheel={{ step: 0.08 }}
              doubleClick={{ mode: 'zoomIn' }}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  <div className="zoom-controls">
                    <button type="button" onClick={() => zoomIn()} aria-label="Vergrössern">+</button>
                    <button type="button" onClick={() => zoomOut()} aria-label="Verkleinern">−</button>
                    <button type="button" onClick={() => resetTransform()} aria-label="Ansicht zurücksetzen">↺</button>
                  </div>
                  <TransformComponent wrapperClass="tree-viewport" contentClass="tree-transform">
                    <div className="family-tree">
                      <ul className="tree-root">
                        <TreeNode
                          personId={rootId}
                          depthLimit={depthLimit}
                          selectedId={selectedId}
                          pathIds={pathIds}
                          onSelect={(id) => selectPerson(id)}
                        />
                      </ul>
                    </div>
                  </TransformComponent>
                </>
              )}
            </TransformWrapper>

            <div className="canvas-help">
              Ziehen zum Verschieben · Scrollen/Pinch zum Zoomen · Person antippen für Details
            </div>
          </div>
        </section>

        <DetailPanel
          person={selectedPerson}
          onClose={() => setSelectedId(rootId)}
          onSelect={(id) => selectPerson(id, true)}
        />
      </main>

      <footer>
        <span>Privater Prototyp · keine Veröffentlichung personenbezogener Daten vorgesehen</span>
        <span>Quelle: Familienunterlagen «Nachkommen von Sebastian Villiger»</span>
      </footer>
    </div>
  )
}
