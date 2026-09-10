import { usePrivacy } from './PrivacyContext'
import { isPotentiallyLivingRecord } from './privacy'
import { relationLabel } from './familyGraph'
import type { FamilyMember } from './familyGraph'
import type { Person } from './types'

const monthNames = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
]

function formatDate(value?: string) {
  if (!value) return 'nicht angegeben'
  if (/^\d{4}$/.test(value)) return value
  const [year, month, day] = value.split('-').map(Number)
  if (!year || !month || !day) return value
  return `${day}. ${monthNames[month - 1]} ${year}`
}

export default function PartnerPersonSheet({
  member,
  linkedPerson,
  open,
  onClose,
  onNavigateLinked,
}: {
  member?: FamilyMember
  linkedPerson?: Person
  open: boolean
  onClose: () => void
  onNavigateLinked: (id: string) => void
}) {
  const { mode } = usePrivacy()
  if (!member || member.kind !== 'partner') return null

  const protectedMember = mode === 'protected' && isPotentiallyLivingRecord(member)

  return (
    <>
      <button
        type="button"
        className={`partner-person-backdrop${open ? ' is-open' : ''}`}
        aria-label="Partnerdetails schliessen"
        onClick={onClose}
      />
      <aside
        className={`partner-person-sheet${open ? ' is-open' : ''}`}
        aria-label={`Details zu ${member.name}`}
        aria-hidden={!open}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="partner-person-header">
          <div>
            <span className="eyebrow">Eigenständiger Partnerdatensatz</span>
            <h2>{member.name}</h2>
            <span className="partner-type-badge">{relationLabel(member)}</span>
            {protectedMember && <span className="privacy-badge">Lebensdaten geschützt</span>}
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Schliessen">×</button>
        </div>

        <section className="partner-person-section">
          <h3>Beziehung</h3>
          {linkedPerson ? (
            <button
              type="button"
              className="partner-linked-person"
              onClick={() => {
                onClose()
                onNavigateLinked(linkedPerson.id)
              }}
            >
              <span>{member.relationship ?? 'Partnerschaft'}{member.relationshipStatus ? ` · ${member.relationshipStatus}` : ''}</span>
              <strong>{linkedPerson.name}</strong>
              <b aria-hidden="true">→</b>
            </button>
          ) : (
            <p>Die zugehörige Person konnte nicht aufgelöst werden.</p>
          )}
        </section>

        <section className="partner-person-section">
          <h3>Lebensdaten</h3>
          {protectedMember ? (
            <div className="partner-protected-box">
              Im Schutzmodus werden Lebensdaten potenziell lebender Partnerpersonen verborgen.
            </div>
          ) : (
            <dl className="facts">
              <div><dt>Geburt</dt><dd>{formatDate(member.birth)}</dd></div>
              <div><dt>Geburtsort</dt><dd>{member.birthPlace ?? 'nicht angegeben'}</dd></div>
              <div><dt>Tod</dt><dd>{formatDate(member.death)}</dd></div>
              <div><dt>Sterbeort</dt><dd>{member.deathPlace ?? 'nicht angegeben'}</dd></div>
            </dl>
          )}
        </section>

        {!protectedMember && member.notes && (
          <section className="partner-person-section">
            <h3>Hinweis</h3>
            <p className="uncertain-note">{member.notes}</p>
          </section>
        )}

        <section className="partner-person-section source-section">
          <h3>Quelle & Modellierung</h3>
          <p>Nachkommen von Sebastian Villiger, Seite {member.source} von 9.</p>
          <p className="source-hint">
            Dieser Partner wurde aus dem bisherigen Beziehungsfeld als eigenständige Person mit stabiler ID in den Familiengraph überführt. Eltern oder weitere Vorfahren werden nicht ergänzt, solange sie nicht in einer Quelle belegt sind.
          </p>
        </section>
      </aside>
    </>
  )
}
