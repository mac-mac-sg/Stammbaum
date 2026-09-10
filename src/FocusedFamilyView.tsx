import { useState } from 'react'
import PartnerPersonSheet from './PartnerPersonSheet'
import RelationshipFinder from './RelationshipFinder'
import { useEdits } from './EditContext'
import { partnerMembersForPerson, relationLabel } from './familyGraph'
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

function CompactPerson({
  person,
  label,
  selected = false,
  onSelect,
}: {
  person: Person
  label?: string
  selected?: boolean
  onSelect: (id: string) => void
}) {
  const { mode } = usePrivacy()
  const { getLifeStatus, hasEdit } = useEdits()
  const protectedPerson = isProtectedPerson(person, mode, getLifeStatus(person.id))

  return (
    <button
      type="button"
      className={`focus-person-card${selected ? ' is-selected' : ''}`}
      onClick={() => onSelect(person.id)}
    >
      <span className="focus-card-meta">
        {label ?? `Generation ${person.generation}`}
        <b>#{person.number}</b>
      </span>
      <strong>{person.name}</strong>
      <span className={`focus-card-life${protectedPerson ? ' protected-value' : ''}`}>
        {protectedPerson
          ? 'Lebensdaten geschützt'
          : <>
              {person.birth ? `* ${formatDate(person.birth)}` : 'Geburtsdatum offen'}
              {person.death ? ` · † ${formatDate(person.death)}` : ''}
            </>}
      </span>
      {protectedPerson && <span className="privacy-badge">Geschützt</span>}
      {hasEdit(person.id) && <span className="local-edit-badge">Lokal korrigiert</span>}
    </button>
  )
}

function PartnerFocusCard({
  member,
  onOpen,
}: {
  member: FamilyMember
  onOpen: (member: FamilyMember) => void
}) {
  const { mode } = usePrivacy()
  const protectedMember = mode === 'protected' && isPotentiallyLivingRecord(member)

  return (
    <button type="button" className="partner-focus-card" onClick={() => onOpen(member)}>
      <span className="partner-focus-type">{relationLabel(member)}</span>
      <strong>{member.name}</strong>
      <span className={`partner-focus-life${protectedMember ? ' protected-value' : ''}`}>
        {protectedMember
          ? 'Lebensdaten geschützt'
          : member.birth
            ? `* ${formatDate(member.birth)}${member.birthPlace ? ` · ${member.birthPlace}` : ''}`
            : member.birthPlace ?? 'Keine weiteren Lebensdaten erfasst'}
      </span>
      <span className="partner-focus-arrow" aria-hidden="true">→</span>
    </button>
  )
}

export default function FocusedFamilyView({
  person,
  onSelect,
  onOpenDetails,
}: {
  person: Person
  onSelect: (id: string) => void
  onOpenDetails: () => void
}) {
  const [relationshipOpen, setRelationshipOpen] = useState(false)
  const [selectedPartner, setSelectedPartner] = useState<FamilyMember | undefined>()
  const { getPerson } = useEdits()
  const parent = person.parentId ? getPerson(person.parentId) : undefined
  const siblings = parent
    ? parent.childIds
        .filter((id) => id !== person.id)
        .map((id) => getPerson(id))
        .filter((value): value is Person => Boolean(value))
    : []
  const children = person.childIds
    .map((id) => getPerson(id))
    .filter((value): value is Person => Boolean(value))
  const partners = partnerMembersForPerson(person)

  const ancestors: Person[] = []
  let current = person.parentId ? getPerson(person.parentId) : undefined
  while (current) {
    ancestors.unshift(current)
    current = current.parentId ? getPerson(current.parentId) : undefined
  }

  return (
    <div className="focus-view" aria-label={`Familienfokus für ${person.name}`}>
      {ancestors.length > 0 && (
        <div className="ancestor-strip" aria-label="Abstammungslinie">
          {ancestors.map((ancestor, index) => (
            <span key={ancestor.id}>
              {index > 0 && <i aria-hidden="true">›</i>}
              <button type="button" onClick={() => onSelect(ancestor.id)}>{ancestor.name}</button>
            </span>
          ))}
        </div>
      )}

      <div className="focus-stage">
        {parent && (
          <section className="focus-family-section parent-section">
            <div className="focus-section-heading">
              <span>Eine Generation zurück</span>
              <small>Elternlinie</small>
            </div>
            <CompactPerson person={parent} label="Elternlinie" onSelect={onSelect} />
            <div className="focus-connector down" aria-hidden="true" />
          </section>
        )}

        <section className="focus-family-section selected-section">
          <div className="focus-section-heading">
            <span>Im Fokus</span>
            <small>Generation {person.generation}</small>
          </div>
          <CompactPerson person={person} selected label="Ausgewählte Person" onSelect={() => onOpenDetails()} />
          <div className="focus-actions">
            <button type="button" className="focus-details-button" onClick={onOpenDetails}>
              Personendetails
              <span aria-hidden="true">→</span>
            </button>
            <button type="button" className="focus-relationship-button" onClick={() => setRelationshipOpen(true)}>
              Verwandtschaft finden
              <span aria-hidden="true">↔</span>
            </button>
          </div>
        </section>

        {partners.length > 0 && (
          <section className="focus-family-section">
            <div className="focus-section-heading">
              <span>Partnerinnen & Partner</span>
              <small>{partners.length}</small>
            </div>
            <div className="partner-focus-list">
              {partners.map((partner) => (
                <PartnerFocusCard key={partner.id} member={partner} onOpen={setSelectedPartner} />
              ))}
            </div>
          </section>
        )}

        {siblings.length > 0 && (
          <section className="focus-family-section">
            <div className="focus-section-heading">
              <span>Geschwister</span>
              <small>{siblings.length}</small>
            </div>
            <div className="focus-horizontal-list">
              {siblings.map((sibling) => (
                <CompactPerson key={sibling.id} person={sibling} label="Geschwister" onSelect={onSelect} />
              ))}
            </div>
          </section>
        )}

        <section className="focus-family-section children-section">
          <div className="focus-section-heading">
            <span>Kinder</span>
            <small>{children.length || 'keine erfasst'}</small>
          </div>
          {children.length > 0 ? (
            <div className="focus-horizontal-list">
              {children.map((child) => (
                <CompactPerson key={child.id} person={child} label="Kind" onSelect={onSelect} />
              ))}
            </div>
          ) : (
            <div className="focus-empty">Für diese Person sind in den Unterlagen keine Kinder erfasst.</div>
          )}
        </section>
      </div>

      <RelationshipFinder
        person={person}
        open={relationshipOpen}
        onClose={() => setRelationshipOpen(false)}
        onNavigate={onSelect}
      />

      <PartnerPersonSheet
        member={selectedPartner}
        linkedPerson={selectedPartner?.linkedPersonId ? getPerson(selectedPartner.linkedPersonId) : undefined}
        open={Boolean(selectedPartner)}
        onClose={() => setSelectedPartner(undefined)}
        onNavigateLinked={onSelect}
      />
    </div>
  )
}
