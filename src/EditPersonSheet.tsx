import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { useEdits } from './EditContext'
import { lifeStatusLabel } from './privacy'
import type { LifeStatus } from './privacy'
import type { Person } from './types'

interface FormState {
  birth: string
  birthPlace: string
  death: string
  deathPlace: string
  notes: string
  lifeStatus: LifeStatus
}

function toFormState(person: Person, lifeStatus: LifeStatus): FormState {
  return {
    birth: person.birth ?? '',
    birthPlace: person.birthPlace ?? '',
    death: person.death ?? '',
    deathPlace: person.deathPlace ?? '',
    notes: person.notes ?? '',
    lifeStatus,
  }
}

function validDateValue(value: string) {
  if (!value.trim()) return true
  return /^\d{4}(-\d{2}-\d{2})?$/.test(value.trim())
}

export default function EditPersonSheet({
  person,
  open,
  onClose,
}: {
  person: Person
  open: boolean
  onClose: () => void
}) {
  const { getLifeStatus, hasEdit, resetEdit, saveEdit } = useEdits()
  const [form, setForm] = useState<FormState>(() => toFormState(person, getLifeStatus(person.id)))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!open) return
    setForm(toFormState(person, getLifeStatus(person.id)))
    setError('')
  }, [getLifeStatus, open, person])

  const statusHint = useMemo(() => {
    if (form.lifeStatus === 'living') return 'Im Schutzmodus werden die Lebensdaten dieser Person immer verborgen.'
    if (form.lifeStatus === 'deceased') return 'Im Schutzmodus dürfen die erfassten Lebensdaten angezeigt werden.'
    return 'Ohne Festlegung entscheidet weiterhin die konservative 120-Jahre-Heuristik.'
  }, [form.lifeStatus])

  const update = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
  }

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

    saveEdit(person.id, {
      birth,
      birthPlace: form.birthPlace.trim(),
      death,
      deathPlace: form.deathPlace.trim(),
      notes: form.notes.trim(),
      lifeStatus: form.lifeStatus,
    })
    onClose()
  }

  const reset = () => {
    resetEdit(person.id)
    setForm(toFormState(person, 'unknown'))
    setError('')
    onClose()
  }

  return (
    <>
      <button
        type="button"
        className={`edit-backdrop${open ? ' is-open' : ''}`}
        aria-label="Bearbeitung schliessen"
        onClick={onClose}
      />
      <aside className={`edit-sheet${open ? ' is-open' : ''}`} aria-label={`${person.name} bearbeiten`} aria-hidden={!open}>
        <div className="sheet-handle" aria-hidden="true" />
        <div className="edit-header">
          <div>
            <span className="eyebrow">Lokale Korrektur</span>
            <h2>{person.name}</h2>
          </div>
          <button type="button" className="icon-button" onClick={onClose} aria-label="Bearbeitung schliessen">×</button>
        </div>

        <div className="edit-notice">
          Diese Angaben werden nur auf diesem Gerät gespeichert. Die Scanquelle und die Daten im Repository bleiben unverändert.
        </div>

        <form className="edit-form" onSubmit={submit}>
          <fieldset>
            <legend>Lebensstatus</legend>
            <div className="status-options">
              {(['unknown', 'living', 'deceased'] as LifeStatus[]).map((status) => (
                <label key={status} className={form.lifeStatus === status ? 'is-selected' : ''}>
                  <input
                    type="radio"
                    name="lifeStatus"
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
            <legend>Lebensdaten</legend>
            <label>
              <span>Geburtsdatum</span>
              <input value={form.birth} onChange={(event) => update('birth', event.target.value)} placeholder="YYYY oder YYYY-MM-DD" inputMode="numeric" />
            </label>
            <label>
              <span>Geburtsort</span>
              <input value={form.birthPlace} onChange={(event) => update('birthPlace', event.target.value)} placeholder="Ort" />
            </label>
            <label>
              <span>Sterbedatum</span>
              <input value={form.death} onChange={(event) => update('death', event.target.value)} placeholder="YYYY oder YYYY-MM-DD" inputMode="numeric" />
            </label>
            <label>
              <span>Sterbeort</span>
              <input value={form.deathPlace} onChange={(event) => update('deathPlace', event.target.value)} placeholder="Ort" />
            </label>
          </fieldset>

          <fieldset>
            <legend>Notiz</legend>
            <label>
              <span>Ergänzung oder Korrekturhinweis</span>
              <textarea value={form.notes} onChange={(event) => update('notes', event.target.value)} rows={4} placeholder="Herkunft der Korrektur möglichst kurz festhalten" />
            </label>
          </fieldset>

          {error && <div className="edit-error" role="alert">{error}</div>}

          <div className="edit-actions">
            {hasEdit(person.id) && (
              <button type="button" className="edit-reset" onClick={reset}>Lokale Änderung verwerfen</button>
            )}
            <button type="submit" className="edit-save">Änderungen speichern</button>
          </div>
        </form>
      </aside>
    </>
  )
}
