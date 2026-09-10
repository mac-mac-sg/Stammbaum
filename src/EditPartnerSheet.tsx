import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useEdits } from './EditContext'
import { lifeStatusLabel } from './privacy'
import type { LifeStatus } from './privacy'
import type { FamilyMember } from './familyGraph'
import type { Partner } from './types'

interface FormState {
  birth: string
  birthPlace: string
  death: string
  deathPlace: string
  notes: string
  lifeStatus: LifeStatus
  relationship: Partner['relationship']
  relationshipStatus: '' | NonNullable<Partner['status']>
}

function toFormState(member: FamilyMember, lifeStatus: LifeStatus): FormState {
  return {
    birth: member.birth ?? '',
    birthPlace: member.birthPlace ?? '',
    death: member.death ?? '',
    deathPlace: member.deathPlace ?? '',
    notes: member.notes ?? '',
    lifeStatus,
    relationship: member.relationship ?? 'Partnerschaft',
    relationshipStatus: member.relationshipStatus ?? '',
  }
}

function validDateValue(value: string) {
  if (!value.trim()) return true
  return /^\d{4}(-\d{2}-\d{2})?$/.test(value.trim())
}

export default function EditPartnerSheet({
  member,
  open,
  onClose,
}: {
  member: FamilyMember
  open: boolean
  onClose: () => void
}) {
  const {
    getPartnerLifeStatus,
    hasPartnerEdit,
    resetPartnerEdit,
    savePartnerEdit,
  } = useEdits()
  const [form, setForm] = useState<FormState>(() => toFormState(member, getPartnerLifeStatus(member.id)))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(toFormState(member, getPartnerLifeStatus(member.id)))
    setError('')
  }, [getPartnerLifeStatus, member, open])

  const statusHint = useMemo(() => {
    if (form.lifeStatus === 'living') return 'Im Schutzmodus werden die Lebensdaten dieser Partnerperson immer verborgen.'
    if (form.lifeStatus === 'deceased') return 'Im Schutzmodus dürfen die erfassten Lebensdaten angezeigt werden.'
    return 'Ohne Festlegung entscheidet weiterhin die konservative 120-Jahre-Heuristik.'
  }, [form.lifeStatus])

  const submit = (event: FormEvent) => {
    event.preventDefault()
    const birth = form.birth.trim()
    const death = form.death.trim()

    if (!validDateValue(birth) || !validDateValue(death)) {
      setError('Datumswerte bitte als YYYY oder YYYY-MM-DD erfassen.')
      return
    }
    if (form.lifeStatus === 'living' && death) {
      setError('Eine als lebend markierte Person kann nicht gleichzeitig ein Sterbedatum haben.')
      return
    }

    savePartnerEdit(member.id, {
      birth,
      birthPlace: form.birthPlace.trim(),
      death,
      deathPlace: form.deathPlace.trim(),
      notes: form.notes.trim(),
      lifeStatus: form.lifeStatus,
      relationship: form.relationship,
      relationshipStatus: form.relationshipStatus || null,
    })
    onClose()
  }

  const reset = () => {
    resetPartnerEdit(member.id)
    setError('')
    onClose()
  }

  return (
    <>
      <button
        type="button"
        className={`edit-backdrop partner-edit-backdrop${open ? ' is-open' : ''}`}
        aria-label="Partnerbearbeitung schliessen"
        onClick={onClose}
      />
      <aside
        className={`edit-sheet partner-edit-sheet${open ? ' is-open' : ''}`}
        aria-label={`${member.name} bearbeiten`}
        aria-hidden={!open}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="edit-header">
          <div>
            <span className="eyebrow">Lokale Partnerkorrektur</span>
            <h2>{member.name}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Bearbeitung schliessen">×</button>
        </div>

        <div className="edit-notice">
          Diese Korrektur gilt nur lokal auf diesem Gerät. Die ursprüngliche Familienquelle und der zentrale Datensatz bleiben unverändert.
        </div>

        <form className="edit-form" onSubmit={submit}>
          <fieldset>
            <legend>Lebensstatus</legend>
            <div className="status-options">
              {(['unknown', 'living', 'deceased'] as LifeStatus[]).map((status) => (
                <label key={status} className={form.lifeStatus === status ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name={`partner-life-status-${member.id}`}
                    value={status}
                    checked={form.lifeStatus === status}
                    onChange={() => setForm((current) => ({ ...current, lifeStatus: status }))}
                  />
                  <strong>{lifeStatusLabel(status)}</strong>
                </label>
              ))}
            </div>
            <p className="edit-hint">{statusHint}</p>
          </fieldset>

          <fieldset>
            <legend>Beziehung</legend>
            <label>
              <span>Beziehungstyp</span>
              <select
                value={form.relationship}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  relationship: event.target.value as Partner['relationship'],
                }))}
              >
                <option value="Ehe">Ehe</option>
                <option value="Partnerschaft">Partnerschaft</option>
                <option value="Verlobung">Verlobung</option>
              </select>
            </label>
            <label>
              <span>Beziehungsstatus</span>
              <select
                value={form.relationshipStatus}
                onChange={(event) => setForm((current) => ({
                  ...current,
                  relationshipStatus: event.target.value as FormState['relationshipStatus'],
                }))}
              >
                <option value="">kein besonderer Status</option>
                <option value="geschieden">geschieden</option>
                <option value="annulliert">annulliert</option>
              </select>
            </label>
          </fieldset>

          <fieldset>
            <legend>Lebensdaten</legend>
            <label>
              <span>Geburtsdatum</span>
              <input
                value={form.birth}
                onChange={(event) => setForm((current) => ({ ...current, birth: event.target.value }))}
                placeholder="YYYY oder YYYY-MM-DD"
                inputMode="numeric"
              />
            </label>
            <label>
              <span>Geburtsort</span>
              <input
                value={form.birthPlace}
                onChange={(event) => setForm((current) => ({ ...current, birthPlace: event.target.value }))}
                placeholder="Ort"
              />
            </label>
            <label>
              <span>Sterbedatum</span>
              <input
                value={form.death}
                onChange={(event) => setForm((current) => ({ ...current, death: event.target.value }))}
                placeholder="YYYY oder YYYY-MM-DD"
                inputMode="numeric"
              />
            </label>
            <label>
              <span>Sterbeort</span>
              <input
                value={form.deathPlace}
                onChange={(event) => setForm((current) => ({ ...current, deathPlace: event.target.value }))}
                placeholder="Ort"
              />
            </label>
          </fieldset>

          <fieldset>
            <legend>Notiz</legend>
            <label>
              <span>Ergänzung oder Korrekturhinweis</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))}
                rows={4}
                placeholder="Herkunft der Korrektur möglichst kurz festhalten"
              />
            </label>
          </fieldset>

          {error && <div className="edit-error" role="alert">{error}</div>}

          <div className="edit-actions">
            {hasPartnerEdit(member.id) && (
              <button type="button" className="edit-reset" onClick={reset}>Lokale Änderung verwerfen</button>
            )}
            <button type="submit" className="edit-save">Partneränderungen speichern</button>
          </div>
        </form>
      </aside>
    </>
  )
}
