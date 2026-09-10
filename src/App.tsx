import { useMemo, useRef, useState } from 'react'
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch'
import EditPersonSheet from './EditPersonSheet'
import FocusedFamilyView from './FocusedFamilyView'
import MobileSearchSheet from './MobileSearchSheet'
import { useEdits } from './EditContext'
import { usePrivacy } from './PrivacyContext'
import {
  isProtectedPartner,
  isProtectedPerson,
  lifeStatusLabel,
  protectedSearchParts,
  privacyModeLabel,
} from './privacy'
import type { LifeStatus, PrivacyMode } from './privacy'
import { people, peopleById, rootId } from './data'
import type { Person } from './types'

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

type ViewMode = 'focus' | 'tree'

function formatDate(value?: string) {
  if (!value) return 'unbekannt'
  if (/^\d{4}$/.test(value)) return value
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return `${day}. ${monthNames[month - 1]} ${year}`
}

function lifeLabel(person: Person, privacyMode: PrivacyMode, lifeStatus: LifeStatus) {
  if (isProtectedPerson(person, privacyMode, lifeStatus)) return 'Lebensdaten geschützt'
  const birth = person.birth ? formatDate(person.birth) : '?'
  const death = person.death ? formatDate(person.death) : ''
  return death ? `${birth} – ${death}` : `* ${birth}`
}

function searchText(person: Person, privacyMode: PrivacyMode, lifeStatus: LifeStatus) {
  const partnerParts = person.partners.flatMap((partner) => {
    if (isProtectedPartner(partner, privacyMode)) return [partner.name]
    return [partner.name, partner.birth, partner.birthPlace, partner.death, partner.deathPlace]
  })

  return [
    person.name,
    ...protectedSearchParts(person, privacyMode, lifeStatus),
    ...partnerParts,
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
  const { mode } = usePrivacy()
  const { getLifeStatus, hasEdit } = useEdits()
  const partner = person.partners[0]
  const lifeStatus = getLifeStatus(person.id)
  const protectedPerson = isProtectedPerson(person, mode, lifeStatus)

  return (
    <button
      id={`person-${person.id}`}
      className={`person-card${selected ? ' is-selected' : ''}${inPath ? ' is-path' : ''}`}
      onClick={() => onSelect(person.id)}
      type="button"
    >
      <span className="source-number">{person.number}</span>
      <span className="person-name">{person.name}</span>
      <span className={`person-life${protectedPerson ? ' protected-value' : ''}`}>{lifeLabel(person, mode, lifeStatus)}</span>
      {protectedPerson && <span className="privacy-badge">Geschützt</span>}
      {hasEdit(person.id) && <span className="local-edit-badge">Lokal korrigiert</span>}
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
  const { getPerson } = useEdits()
  const person = getPerson(personId)
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
  open,
  onClose,
  onSelect,
  onEdit,
}: {
  person: Person
  open: boolean
  onClose: () => void
  onSelect: (id: string) => void
  onEdit: () => void
}) {
  const { mode } = usePrivacy()
  const { getLifeStatus, getPerson, hasEdit } = useEdits()
  const parent = person.parentId ? getPerson(person.parentId) : undefined
  const children = person.childIds
    .map((id) => getPerson(id))
    .filter((value): value is Person => Boolean(value))
  const path = getPathToRoot(person.id)
    .map((id) => getPerson(id))
    .filter((value): value is Person => Boolean(value))
  const lifeStatus = getLifeStatus(person.id)
  const protectedPerson = isProtectedPerson(person, mode, lifeStatus)

  return (
    <aside className={`detail-panel${open ? ' is-open' : ''}`} aria-label={`Details zu ${person.name}`}>
      <div className="sheet-handle" aria-hidden="true" />
      <div className="detail-topbar">
        <div>
          <span className="eyebrow">Person #{person.number} · Generation {person.generation}</span>
          <h2>{person.name}</h2>
          {protectedPerson && <span className="privacy-badge">Lebensdaten geschützt</span>}
          {hasEdit(person.id) && <span className="local-edit-badge">Lokale Korrektur aktiv</span>}
        </div>
        <div className="detail-topbar-actions">
          {mode === 'private' && (
            <button className="edit-button" type="button" onClick={onEdit}>Bearbeiten</button>
          )}
          <button className="icon-button" type="button" onClick={onClose} aria-label="Details schliessen">×</button>
        </div>
      </div>

      <section className="detail-section">
        <h3>Lebensdaten</h3>
        <dl className="facts">
          <div>
            <dt>Geburt</dt>
            <dd className={protectedPerson ? 'protected-value' : undefined}>
              {protectedPerson ? 'im Schutzmodus verborgen' : person.birth ? formatDate(person.birth) : 'nicht angegeben'}
            </dd>
          </div>
          <div>
            <dt>Geburtsort</dt>
            <dd className={protectedPerson ? 'protected-value' : undefined}>
              {protectedPerson ? 'im Schutzmodus verborgen' : person.birthPlace || 'nicht angegeben'}
            </dd>
          </div>
          <div>
            <dt>Tod</dt>
            <dd className={protectedPerson ? 'protected-value' : undefined}>
              {protectedPerson ? 'im Schutzmodus verborgen' : person.death ? formatDate(person.death) : 'kein Sterbedatum in der Quelle'}
            </dd>
          </div>
          <div>
            <dt>Sterbeort</dt>
            <dd className={protectedPerson ? 'protected-value' : undefined}>
              {protectedPerson ? 'im Schutzmodus verborgen' : person.deathPlace || 'nicht angegeben'}
            </dd>
          </div>
        </dl>
        <p className="source-hint">
          Lebensstatus: {lifeStatusLabel(lifeStatus)}{lifeStatus === 'unknown' ? ' · Schutz über Heuristik' : ' · lokal festgelegt'}
        </p>
      </section>

      {person.partners.length > 0 && (
        <section className="detail-section">
          <h3>Beziehungen</h3>
          <div className="relationship-list">
            {person.partners.map((partner, index) => {
              const protectedPartner = isProtectedPartner(partner, mode)
              return (
                <article className="relationship-card" key={`${partner.name}-${index}`}>
                  <strong>{partner.name}</strong>
                  <span>{partner.relationship}{partner.status ? ` · ${partner.status}` : ''}</span>
                  {protectedPartner ? (
                    <span className="protected-value">Lebensdaten im Schutzmodus verborgen</span>
                  ) : (
                    <>
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
                    </>
                  )}
                  {!protectedPartner && partner.notes && <span className="uncertain-note">{partner.notes}</span>}
                </article>
              )
            })}
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
              <button type="button" onClick={() => onSelect(pathPerson.id)}>{pathPerson.name}</button>
            </span>
          ))}
        </div>
      </section>

      {(person.notes || person.source) && (
        <section className="detail-section source-section">
          <h3>Quelle & Datenqualität</h3>
          <p>Nachkommen von Sebastian Villiger, Seite {person.source} von 9.</p>
          {!protectedPerson && person.notes && <p className="uncertain-note">{person.notes}</p>}
          {protectedPerson && person.notes && (
            <p className="protected-value">Zusatznotizen werden für potenziell lebende Personen im Schutzmodus ebenfalls verborgen.</p>
          )}
          <p className="source-hint">
            Angaben wurden aus den bereitgestellten Scans übertragen. Lokale Korrekturen überschreiben die Quelle nicht.
          </p>
        </section>
      )}
    </aside>
  )
}

export default function App() {
  const { mode: privacyMode, toggleMode } = usePrivacy()
  const { editedCount, getLifeStatus, getPerson } = useEdits()
  const [selectedId, setSelectedId] = useState('p095')
  const [query, setQuery] = useState('')
  const [depthLimit, setDepthLimit] = useState(5)
  const [detailOpen, setDetailOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches ? 'focus' : 'tree',
  )
  const zoomRef = useRef<any>(null)
  const searchRef = useRef<HTMLInputElement>(null)

  const selectedPerson = getPerson(selectedId) ?? getPerson(rootId) ?? peopleById[rootId]
  const pathIds = useMemo(() => new Set(getPathToRoot(selectedPerson.id)), [selectedPerson.id])
  const effectivePeople = useMemo(
    () => people.map((person) => getPerson(person.id) ?? person),
    [getPerson],
  )

  const results = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('de-CH')
    if (!normalized) return []
    return effectivePeople
      .filter((person) => searchText(person, privacyMode, getLifeStatus(person.id)).includes(normalized))
      .slice(0, 10)
  }, [effectivePeople, getLifeStatus, privacyMode, query])

  const focusPerson = (id: string, scale = 0.86) => {
    window.setTimeout(() => {
      zoomRef.current?.zoomToElement?.(`person-${id}`, scale, 450)
    }, 100)
  }

  const navigatePerson = (
    id: string,
    options: { focusTree?: boolean; details?: boolean } = {},
  ) => {
    const person = getPerson(id)
    if (!person) return
    setSelectedId(id)
    setDetailOpen(Boolean(options.details))
    setEditOpen(false)
    setMobileSearchOpen(false)
    if (person.generation > depthLimit) setDepthLimit(person.generation)
    setQuery('')
    if (options.focusTree && viewMode === 'tree') focusPerson(id)
  }

  const switchView = (mode: ViewMode) => {
    setDetailOpen(false)
    setEditOpen(false)
    setMobileSearchOpen(false)
    setViewMode(mode)
    if (mode === 'tree') focusPerson(selectedPerson.id, 0.72)
  }

  const openSearch = () => {
    setDetailOpen(false)
    setEditOpen(false)
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 820px)').matches) {
      setMobileSearchOpen(true)
      return
    }
    window.setTimeout(() => {
      searchRef.current?.focus()
      searchRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 40)
  }

  const togglePrivacy = () => {
    setEditOpen(false)
    toggleMode()
  }

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="brand">
          <div className="brand-mark" aria-hidden="true"><span /><span /><span /></div>
          <div>
            <span className="eyebrow">Familienarchiv</span>
            <h1>Stammbaum Villiger</h1>
          </div>
        </div>

        <div className="header-actions">
          <button
            type="button"
            className={`privacy-toggle${privacyMode === 'protected' ? ' is-protected' : ''}`}
            onClick={togglePrivacy}
            aria-pressed={privacyMode === 'protected'}
            aria-label={`${privacyModeLabel(privacyMode)}. Ansicht wechseln.`}
            title={`${privacyModeLabel(privacyMode)} – antippen zum Wechseln`}
          >
            <span className="privacy-icon" aria-hidden="true">{privacyMode === 'protected' ? '◈' : '○'}</span>
            <span className="privacy-copy">
              <strong>{privacyMode === 'protected' ? 'Schutzmodus' : 'Vollansicht'}</strong>
              <small>{privacyMode === 'protected' ? 'Lebensdaten verborgen' : `${editedCount} lokale Änderungen`}</small>
            </span>
          </button>

          <div className="header-stats" aria-label="Datenbestand">
            <div><strong>{people.length}</strong><span>Personen</span></div>
            <div><strong>5</strong><span>Generationen</span></div>
            <div><strong>{people.reduce((sum, p) => sum + p.partners.length, 0)}</strong><span>Beziehungen</span></div>
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
                  ref={searchRef}
                  id="family-search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={privacyMode === 'protected' ? 'Name suchen' : 'Name, Ort oder Jahr'}
                  autoComplete="off"
                  enterKeyHint="search"
                />
                {query && <button type="button" onClick={() => setQuery('')} aria-label="Suche leeren">×</button>}
              </div>
              {results.length > 0 && (
                <div className="search-results">
                  {results.map((person) => {
                    const protectedResult = isProtectedPerson(person, privacyMode, getLifeStatus(person.id))
                    return (
                      <button type="button" key={person.id} onClick={() => navigatePerson(person.id, { focusTree: true })}>
                        <span>
                          <strong>{person.name}</strong>
                          <small>#{person.number} · Generation {person.generation}</small>
                        </span>
                        <span className={protectedResult ? 'protected-value' : undefined}>
                          {protectedResult ? 'geschützt' : person.birth ? formatDate(person.birth) : 'Datum offen'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
              {query && results.length === 0 && <div className="search-results empty">Keine passende Person gefunden.</div>}
            </div>

            <div className="toolbar-controls">
              <div className="view-control">
                <span>Ansicht</span>
                <div className="segmented view-segmented">
                  <button type="button" className={viewMode === 'focus' ? 'active' : ''} onClick={() => switchView('focus')}>Fokus</button>
                  <button type="button" className={viewMode === 'tree' ? 'active' : ''} onClick={() => switchView('tree')}>Gesamt</button>
                </div>
              </div>

              {viewMode === 'tree' && (
                <div className="depth-control">
                  <span>Baumtiefe</span>
                  <div className="segmented">
                    {[2, 3, 4, 5].map((depth) => (
                      <button
                        type="button"
                        key={depth}
                        className={depthLimit === depth ? 'active' : ''}
                        onClick={() => setDepthLimit(depth)}
                        aria-label={`Bis Generation ${depth} anzeigen`}
                      >{depth}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className={`canvas-frame${viewMode === 'focus' ? ' is-focus' : ''}`}>
            {viewMode === 'focus' ? (
              <FocusedFamilyView
                person={selectedPerson}
                onSelect={(id) => navigatePerson(id)}
                onOpenDetails={() => setDetailOpen(true)}
              />
            ) : (
              <TransformWrapper
                ref={zoomRef}
                initialScale={0.34}
                minScale={0.16}
                maxScale={1.6}
                centerOnInit
                limitToBounds={false}
                wheel={{ step: 0.08 }}
                doubleClick={{ disabled: true }}
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
                            onSelect={(id) => navigatePerson(id, { details: true })}
                          />
                        </ul>
                      </div>
                    </TransformComponent>
                  </>
                )}
              </TransformWrapper>
            )}

            {viewMode === 'tree' && (
              <button
                type="button"
                className="selected-chip"
                onClick={() => setDetailOpen(true)}
                aria-label={`Details zu ${selectedPerson.name} öffnen`}
              >
                <span>Ausgewählt</span>
                <strong>{selectedPerson.name}</strong>
              </button>
            )}

            <div className="canvas-help">
              {viewMode === 'focus'
                ? 'Verwandte antippen, um den Familienfokus zu verschieben'
                : 'Ziehen zum Verschieben · Pinch zum Zoomen · Person antippen für Details'}
            </div>
          </div>
        </section>

        <DetailPanel
          person={selectedPerson}
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          onSelect={(id) => navigatePerson(id, { focusTree: true, details: true })}
          onEdit={() => {
            setDetailOpen(false)
            setEditOpen(true)
          }}
        />
      </main>

      <button
        type="button"
        className={`sheet-backdrop${detailOpen ? ' is-open' : ''}`}
        aria-label="Personendetails schliessen"
        onClick={() => setDetailOpen(false)}
      />

      <EditPersonSheet
        person={selectedPerson}
        open={editOpen && privacyMode === 'private'}
        onClose={() => {
          setEditOpen(false)
          setDetailOpen(true)
        }}
      />

      <MobileSearchSheet
        open={mobileSearchOpen}
        onClose={() => setMobileSearchOpen(false)}
        onSelect={(id) => navigatePerson(id)}
      />

      <nav className="mobile-nav" aria-label="App-Navigation">
        <button type="button" onClick={() => switchView(viewMode === 'focus' ? 'tree' : 'focus')}>
          <span aria-hidden="true">{viewMode === 'focus' ? '⌘' : '◎'}</span>
          <small>{viewMode === 'focus' ? 'Gesamt' : 'Fokus'}</small>
        </button>
        <button type="button" onClick={openSearch}>
          <span aria-hidden="true">⌕</span>
          <small>Suchen</small>
        </button>
        <button type="button" className="primary" onClick={() => setDetailOpen(true)}>
          <span aria-hidden="true">●</span>
          <small>Person</small>
        </button>
      </nav>

      <footer>
        <span>
          {privacyMode === 'protected'
            ? 'Schutzmodus aktiv · Lebensdaten potenziell lebender Personen verborgen'
            : `Private Vollansicht · ${editedCount} lokale ${editedCount === 1 ? 'Änderung' : 'Änderungen'}`}
        </span>
        <span>Quelle: Familienunterlagen «Nachkommen von Sebastian Villiger»</span>
      </footer>
    </div>
  )
}
