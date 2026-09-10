import { useEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { peopleById } from './data'
import { useEdits } from './EditContext'
import type { PartnerEdit, PersonEdit } from './EditContext'
import { familyMembersById } from './familyGraph'

type CorrectionChange = {
  label: string
  field: string
  before: unknown
  after: unknown
}

type CorrectionEntry = {
  id: string
  kind: 'person' | 'partner'
  name: string
  meta: string
  updatedAt: string
  changes: CorrectionChange[]
}

const lifeStatusLabels = {
  unknown: 'nicht festgelegt',
  living: 'lebend',
  deceased: 'verstorben',
} as const

function exportFileName() {
  const date = new Date().toISOString().slice(0, 10)
  return `stammbaum-korrekturen-${date}.json`
}

function hasOwn(value: object, key: string) {
  return Object.prototype.hasOwnProperty.call(value, key)
}

function formatDate(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return value
  return `${match[3]}.${match[2]}.${match[1]}`
}

function formatUpdatedAt(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('de-CH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date)
}

function formatValue(field: string, value: unknown, side: 'before' | 'after') {
  if (field === 'lifeStatus') {
    const key = typeof value === 'string' ? value as keyof typeof lifeStatusLabels : 'unknown'
    return lifeStatusLabels[key] ?? String(value)
  }

  if (field === 'relationshipStatus') {
    return value === null || value === undefined || value === '' ? 'kein Status' : String(value)
  }

  if (value === undefined || value === null || value === '') {
    return side === 'after' ? 'entfernt' : 'nicht angegeben'
  }

  if (typeof value === 'string' && /^(\d{4})-(\d{2})-(\d{2})$/.test(value)) {
    return formatDate(value)
  }

  return String(value)
}

function personChanges(id: string, edit: PersonEdit): CorrectionChange[] {
  const base = peopleById[id]
  if (!base) return []

  const changes: CorrectionChange[] = []
  const fields: Array<[keyof Omit<PersonEdit, 'updatedAt'>, string, unknown]> = [
    ['birth', 'Geburtsdatum', base.birth],
    ['birthPlace', 'Geburtsort', base.birthPlace],
    ['death', 'Sterbedatum', base.death],
    ['deathPlace', 'Sterbeort', base.deathPlace],
    ['notes', 'Notiz', base.notes],
    ['lifeStatus', 'Lebensstatus', 'unknown'],
  ]

  for (const [field, label, before] of fields) {
    if (!hasOwn(edit, field)) continue
    const after = edit[field]
    if (after === before) continue
    changes.push({ label, field, before, after })
  }

  return changes
}

function partnerChanges(id: string, edit: PartnerEdit): CorrectionChange[] {
  const base = familyMembersById[id]
  if (!base || base.kind !== 'partner') return []

  const changes: CorrectionChange[] = []
  const fields: Array<[keyof Omit<PartnerEdit, 'updatedAt'>, string, unknown]> = [
    ['birth', 'Geburtsdatum', base.birth],
    ['birthPlace', 'Geburtsort', base.birthPlace],
    ['death', 'Sterbedatum', base.death],
    ['deathPlace', 'Sterbeort', base.deathPlace],
    ['notes', 'Notiz', base.notes],
    ['lifeStatus', 'Lebensstatus', 'unknown'],
    ['relationship', 'Beziehung', base.relationship],
    ['relationshipStatus', 'Beziehungsstatus', base.relationshipStatus],
  ]

  for (const [field, label, before] of fields) {
    if (!hasOwn(edit, field)) continue
    const after = edit[field]
    const comparableBefore = field === 'relationshipStatus' ? before ?? null : before
    const comparableAfter = field === 'relationshipStatus' ? after ?? null : after
    if (comparableAfter === comparableBefore) continue
    changes.push({ label, field, before, after })
  }

  return changes
}

export default function CorrectionDataSheet({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  const {
    clearAllEdits,
    editedCount,
    editedPartnerCount,
    editedPersonCount,
    edits,
    importEdits,
    partnerEdits,
    resetEdit,
    resetPartnerEdit,
  } = useEdits()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const entries = useMemo<CorrectionEntry[]>(() => {
    const people = Object.entries(edits).map(([id, edit]): CorrectionEntry | null => {
      const person = peopleById[id]
      if (!person) return null
      return {
        id,
        kind: 'person',
        name: person.name,
        meta: `Person #${person.number} · Generation ${person.generation}`,
        updatedAt: edit.updatedAt,
        changes: personChanges(id, edit),
      }
    }).filter((entry): entry is CorrectionEntry => Boolean(entry))

    const partners = Object.entries(partnerEdits).map(([id, edit]): CorrectionEntry | null => {
      const partner = familyMembersById[id]
      if (!partner || partner.kind !== 'partner') return null
      const linked = partner.linkedPersonId ? peopleById[partner.linkedPersonId] : undefined
      return {
        id,
        kind: 'partner',
        name: partner.name,
        meta: linked ? `Partnerperson · Bezug zu ${linked.name}` : 'Partnerperson',
        updatedAt: edit.updatedAt,
        changes: partnerChanges(id, edit),
      }
    }).filter((entry): entry is CorrectionEntry => Boolean(entry))

    return [...people, ...partners].sort((a, b) => (
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    ))
  }, [edits, partnerEdits])

  const close = () => {
    setMessage('')
    setConfirmReset(false)
    onClose()
  }

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [open])

  const exportEdits = () => {
    const payload = {
      schema: 'stammbaum-local-corrections',
      version: 2,
      exportedAt: new Date().toISOString(),
      repository: 'mac-mac-sg/Stammbaum',
      personEdits: edits,
      partnerEdits,
    }
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = exportFileName()
    document.body.appendChild(link)
    link.click()
    link.remove()
    URL.revokeObjectURL(url)
    setMessage(`${editedCount} lokale ${editedCount === 1 ? 'Korrektur' : 'Korrekturen'} exportiert.`)
  }

  const importFile = async (file?: File) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text())
      const result = importEdits(parsed)
      if (result.imported === 0) {
        setMessage('Keine gültigen Korrekturen in dieser Datei gefunden.')
      } else {
        const parts = []
        if (result.importedPersons) parts.push(`${result.importedPersons} Personen`)
        if (result.importedPartners) parts.push(`${result.importedPartners} Partnerpersonen`)
        setMessage(`${result.imported} Korrekturen importiert (${parts.join(', ')})${result.skipped ? `, ${result.skipped} Einträge übersprungen` : ''}.`)
      }
    } catch {
      setMessage('Die Datei konnte nicht als gültige JSON-Korrekturdatei gelesen werden.')
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  const resetOne = (entry: CorrectionEntry) => {
    if (entry.kind === 'person') resetEdit(entry.id)
    else resetPartnerEdit(entry.id)
    setConfirmReset(false)
    setMessage(`Lokale Korrektur für ${entry.name} zurückgesetzt.`)
  }

  const resetAll = () => {
    if (!confirmReset) {
      setConfirmReset(true)
      setMessage('Noch einmal antippen, um wirklich alle lokalen Korrekturen zu verwerfen.')
      return
    }
    clearAllEdits()
    setConfirmReset(false)
    setMessage('Alle lokalen Korrekturen wurden auf diesem Gerät verworfen.')
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <>
      <button
        type="button"
        className={`correction-backdrop${open ? ' is-open' : ''}`}
        aria-label="Lokale Korrekturen schliessen"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={close}
      />
      <aside
        className={`correction-sheet${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label="Lokale Korrekturen"
        aria-hidden={!open}
      >
        <div className="sheet-handle" aria-hidden="true" />
        <div className="correction-header">
          <div>
            <span className="eyebrow">Nur auf diesem Gerät</span>
            <h2>Lokale Korrekturen</h2>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Schliessen">×</button>
        </div>

        <div className="correction-summary correction-summary-stacked">
          <strong>{editedCount}</strong>
          <span>
            lokale {editedCount === 1 ? 'Korrektur' : 'Korrekturen'}
            <small>{editedPersonCount} Personen · {editedPartnerCount} Partnerpersonen</small>
          </span>
        </div>

        <p className="correction-repository-note">
          Hier erscheinen nur Änderungen, die in dieser App auf diesem Gerät gespeichert oder importiert wurden. Änderungen am GitHub-Grundbestand sind bereits Teil des Stammbaums und werden hier nicht als lokale Korrektur geführt.
        </p>

        <section className="correction-section correction-overview">
          <div className="correction-section-title">
            <h3>Geänderte Einträge</h3>
            {editedCount > 0 && <span>{editedCount}</span>}
          </div>

          {entries.length === 0 ? (
            <div className="correction-empty">
              <strong>Keine lokalen Korrekturen</strong>
              <span>Der Stammbaum entspricht auf diesem Gerät vollständig dem aktuell veröffentlichten Grundbestand.</span>
            </div>
          ) : (
            <div className="correction-entry-list">
              {entries.map((entry) => (
                <article className="correction-entry" key={entry.id}>
                  <div className="correction-entry-header">
                    <div>
                      <span>{entry.meta}</span>
                      <strong>{entry.name}</strong>
                      <small>Geändert {formatUpdatedAt(entry.updatedAt)}</small>
                    </div>
                    <button type="button" onClick={() => resetOne(entry)}>
                      Zurücksetzen
                    </button>
                  </div>

                  {entry.changes.length > 0 ? (
                    <dl className="correction-diff-list">
                      {entry.changes.map((change) => (
                        <div key={change.field}>
                          <dt>{change.label}</dt>
                          <dd>
                            <span>{formatValue(change.field, change.before, 'before')}</span>
                            <b aria-hidden="true">→</b>
                            <strong>{formatValue(change.field, change.after, 'after')}</strong>
                          </dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="correction-no-diff">Gespeichert, aktuell aber ohne sichtbare Abweichung zum Grundbestand.</p>
                  )}
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="correction-section correction-tools">
          <h3>Sichern & übertragen</h3>
          <p>Export und Import sind optional. Eine exportierte JSON-Datei kann persönliche Daten enthalten.</p>
          <div className="correction-tool-actions">
            <button type="button" className="correction-primary" onClick={exportEdits} disabled={editedCount === 0}>
              Exportieren
            </button>
            <label className="correction-import-button">
              Importieren
              <input
                ref={inputRef}
                className="correction-file-input"
                type="file"
                accept="application/json,.json"
                onChange={(event) => void importFile(event.target.files?.[0])}
              />
            </label>
          </div>
        </section>

        <section className="correction-section danger-section">
          <h3>Alle lokalen Korrekturen</h3>
          <p>Zurücksetzen entfernt nur die lokalen Änderungen dieses Geräts. Der veröffentlichte Grundbestand im Repository bleibt unverändert.</p>
          <button
            type="button"
            className={`correction-reset${confirmReset ? ' is-confirming' : ''}`}
            onClick={resetAll}
            disabled={editedCount === 0}
          >
            {confirmReset ? 'Wirklich alle zurücksetzen' : 'Alle zurücksetzen'}
          </button>
        </section>

        {message && <div className="correction-message" role="status">{message}</div>}
      </aside>
    </>,
    document.body,
  )
}
