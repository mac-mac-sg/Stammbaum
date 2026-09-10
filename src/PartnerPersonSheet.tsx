import { useEffect, useState } from 'react'
import EditPartnerSheet from './EditPartnerSheet'
import { useEdits } from './EditContext'
import { useFamilyNavigation } from './FamilyNavigationContext'
import { usePrivacy } from './PrivacyContext'
import { isPotentiallyLivingRecord, lifeStatusLabel } from './privacy'
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
  const {
    getPartnerLifeStatus,
    getPartnerMember,
    hasPartnerEdit,
  } = useEdits()
  const { isFavorite, recordVisit, toggleFavorite } = useFamilyNavigation()
  const [editOpen, setEditOpen] = useState(false)

  const effectiveMember = member?.kind === 'partner' ? getPartnerMember(member.id) ?? member : undefined

  useEffect(() => {
    if (open && effectiveMember) recordVisit(effectiveMember.id)
  }, [effectiveMember, open, recordVisit])

  if (!effectiveMember || effectiveMember.kind !== 'partner') return null

  const lifeStatus = getPartnerLifeStatus(effectiveMember.id)
  const protectedMember = mode === 'protected' && isPotentiallyLivingRecord(effectiveMember, lifeStatus)
  const locallyEdited = hasPartnerEdit(effectiveMember.id)
  const favorite = isFavorite(effectiveMember.id)

  const close = () => {
    setEditOpen(false)
    onClose()
  }

  return (
    <>
      <button
        type="button"
        className={`partner-person-backdrop${open ? ' is-open' : ''}`}
        aria-label="Partnerdetails schliessen"
        onClick={close}
      />
      <aside
        className={`partner-person-sheet${open ? ' is-open' : ''}`}
        aria-label={`Details zu ${effectiveMember.name}`}
        aria-hidden={!open}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="partner-person-header">
          <div>
            <span className="eyebrow">Partnerperson</span>
            <h2>{effectiveMember.name}</h2>
            <span className="partner-type-badge">{relationLabel(effectiveMember)}</span>
            {protectedMember && <span className="privacy-badge">Lebensdaten geschützt</span>}
            {locallyEdited && <span className="local-edit-badge">Lokal korrigiert</span>}
          </div>
          <div className="partner-person-actions">
            <button
              type="button"
              className={`favorite-button${favorite ? ' is-active' : ''}`}
              onClick={() => toggleFavorite(effectiveMember.id)}
              aria-label={favorite ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
              title={favorite ? 'Favorit entfernen' : 'Als Favorit speichern'}
            >{favorite ? '★' : '☆'}</button>
            {mode === 'private' && (
              <button type="button" className="edit-button" onClick={() => setEditOpen(true)}>Bearbeiten</button>
            )}
            <button type="button" className="icon-button" onClick={close} aria-label="Schliessen">×</button>
          </div>
        </div>

        <section className="partner-person-section">
          <h3>Beziehung</h3>
          {linkedPerson ? (
            <button
              type="button"
              className="partner-linked-person"
              onClick={() => {
                close()
                onNavigateLinked(linkedPerson.id)
              }}
            >
              <span>
                {effectiveMember.relationship ?? 'Partnerschaft'}
                {effectiveMember.relationshipStatus ? ` · ${effectiveMember.relationshipStatus}` : ''}
              </span>
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
              <div><dt>Geburt</dt><dd>{formatDate(effectiveMember.birth)}</dd></div>
              <div><dt>Geburtsort</dt><dd>{effectiveMember.birthPlace ?? 'nicht angegeben'}</dd></div>
              <div><dt>Tod</dt><dd>{formatDate(effectiveMember.death)}</dd></div>
              <div><dt>Sterbeort</dt><dd>{effectiveMember.deathPlace ?? 'nicht angegeben'}</dd></div>
            </dl>
          )}
          <p className="source-hint partner-life-status">
            Lebensstatus: {lifeStatusLabel(lifeStatus)}{lifeStatus === 'unknown' ? ' · Schutz über Heuristik' : ' · lokal festgelegt'}
          </p>
        </section>

        {!protectedMember && effectiveMember.notes && (
          <section className="partner-person-section">
            <h3>Hinweis</h3>
            <p className="uncertain-note">{effectiveMember.notes}</p>
          </section>
        )}

        <section className="partner-person-section source-section">
          <h3>Quelle & Modellierung</h3>
          <p>Nachkommen von Sebastian Villiger, Seite {effectiveMember.source} von 9.</p>
          <p className="source-hint">
            Dieser Partner wurde aus dem dokumentierten Beziehungsfeld als eigenständiger Knoten in den Familiengraph überführt. Lokale Korrekturen verändern die Scanquelle nicht; Eltern oder weitere Vorfahren werden nur ergänzt, wenn sie durch eine Quelle belegt sind.
          </p>
        </section>
      </aside>

      <EditPartnerSheet
        member={effectiveMember}
        open={editOpen && mode === 'private'}
        onClose={() => setEditOpen(false)}
      />
    </>
  )
}
