import { useMemo, useState } from 'react'
import { people } from './data'
import { useEdits } from './EditContext'
import { buildFamilyMembers, descendantMember, relationLabel } from './familyGraph'
import type { FamilyMember } from './familyGraph'
import { searchFamilyMembers } from './memberSearch'
import { usePrivacy } from './PrivacyContext'
import { isPotentiallyLivingRecord, isProtectedPerson } from './privacy'
import { getMemberRelationship } from './relationship'
import type { LifeStatus, PrivacyMode } from './privacy'
import type { Person } from './types'

function isMemberProtected(
  member: FamilyMember,
  mode: PrivacyMode,
  getLifeStatus: (id: string) => LifeStatus,
  getPartnerLifeStatus: (id: string) => LifeStatus,
  getPerson: (id: string) => Person | undefined,
) {
  if (mode !== 'protected') return false
  if (member.kind === 'partner') return isPotentiallyLivingRecord(member, getPartnerLifeStatus(member.id))
  const descendant = getPerson(member.id)
  return descendant ? isProtectedPerson(descendant, mode, getLifeStatus(member.id)) : true
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
  const { mode } = usePrivacy()
  const {
    getLifeStatus,
    getPartnerLifeStatus,
    getPartnerMember,
    getPerson,
  } = useEdits()
  const [query, setQuery] = useState('')
  const [targetId, setTargetId] = useState<string | null>(null)

  const effectivePeople = useMemo(
    () => people.map((candidate) => getPerson(candidate.id) ?? candidate),
    [getPerson],
  )
  const members = useMemo(
    () => buildFamilyMembers(effectivePeople).map((member) => (
      member.kind === 'partner' ? getPartnerMember(member.id) ?? member : member
    )),
    [effectivePeople, getPartnerMember],
  )
  const origin = useMemo(() => descendantMember(person), [person])
  const target = targetId ? members.find((candidate) => candidate.id === targetId) : undefined
  const result = target ? getMemberRelationship(origin, target) : null

  const memberProtected = (member: FamilyMember) => isMemberProtected(
    member,
    mode,
    getLifeStatus,
    getPartnerLifeStatus,
    getPerson,
  )

  const matches = useMemo(
    () => searchFamilyMembers(members, query, memberProtected, 10, origin.id),
    [getLifeStatus, getPartnerLifeStatus, getPerson, members, mode, origin.id, query],
  )

  const chooseTarget = (candidate: FamilyMember) => {
    setTargetId(candidate.id)
    setQuery('')
  }

  const resetTarget = () => {
    setTargetId(null)
    setQuery('')
  }

  const close = () => {
    resetTarget()
    onClose()
  }

  const navigateMember = (member: FamilyMember) => {
    const destination = member.kind === 'partner' ? member.linkedPersonId : member.id
    if (!destination) return
    close()
    onNavigate(destination)
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
              placeholder={mode === 'protected' ? 'Name suchen' : 'Name, Ort oder Jahr'}
              autoComplete="off"
              enterKeyHint="search"
            />
            {query && (
              <div className="relationship-search-results">
                {matches.length > 0 ? matches.map((candidate) => {
                  const linked = candidate.kind === 'partner' && candidate.linkedPersonId
                    ? getPerson(candidate.linkedPersonId)
                    : undefined
                  return (
                    <button type="button" key={candidate.id} onClick={() => chooseTarget(candidate)}>
                      <strong>{candidate.name}</strong>
                      <span>
                        {candidate.kind === 'descendant'
                          ? `#${candidate.number} · Generation ${candidate.generation}`
                          : `${relationLabel(candidate)}${linked ? ` von ${linked.name}` : ''}`}
                        {memberProtected(candidate) ? ' · geschützt' : ''}
                      </span>
                    </button>
                  )
                }) : <p>Keine passende Person gefunden.</p>}
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
                {target.kind === 'partner' && <small className="member-kind-tag">Partnerperson</small>}
              </div>
            </div>

            <div className="relationship-answer">
              <span>Beziehung</span>
              <strong>{result.labelFromAToB}</strong>
              <p>{result.explanation}</p>
            </div>

            <div className="relationship-path">
              <span>Verbindung im erfassten Familiengraph</span>
              <div>
                {result.path.map((pathMember, index) => (
                  <span key={`${pathMember.id}-${index}`}>
                    {index > 0 && <i aria-hidden="true">→</i>}
                    <button type="button" onClick={() => navigateMember(pathMember)}>
                      {pathMember.name}{pathMember.kind === 'partner' ? ' · Partner' : ''}
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button type="button" className="relationship-reset" onClick={resetTarget}>
              Andere Person vergleichen
            </button>
          </div>
        )}

        {target && !result && (
          <div className="relationship-empty">
            <p>Für diese beiden Personen konnte auf Basis der erfassten Abstammungs- und Partnerschaftsverknüpfungen keine Verbindung berechnet werden.</p>
            <button type="button" className="relationship-reset" onClick={resetTarget}>
              Andere Person vergleichen
            </button>
          </div>
        )}

        <p className="relationship-note">
          Partnerinnen und Partner sind eigenständige Knoten im Familiengraph. Lokale Korrekturen an Beziehungstyp und Lebensdaten fliessen sofort in Suche und Darstellung ein. Eltern oder Vorfahren einer Partnerperson werden nicht erfunden, solange sie nicht aus einer Quelle belegt sind.
        </p>
      </aside>
    </>
  )
}
