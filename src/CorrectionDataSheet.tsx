import { useRef, useState } from 'react'
import { useEdits } from './EditContext'

function exportFileName() {
  const date = new Date().toISOString().slice(0, 10)
  return `stammbaum-korrekturen-${date}.json`
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
  } = useEdits()
  const inputRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [confirmReset, setConfirmReset] = useState(false)

  const close = () => {
    setMessage('')
    setConfirmReset(false)
    onClose()
  }

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

  return (
    <>
      <button
        type="button"
        className={`correction-backdrop${open ? ' is-open' : ''}`}
        aria-label="Korrekturdaten schliessen"
        onClick={close}
      />
      <aside className={`correction-sheet${open ? ' is-open' : ''}`} aria-label="Lokale Korrekturdaten" aria-hidden={!open}>
        <div className="sheet-handle" aria-hidden="true" />
        <div className="correction-header">
          <div>
            <span className="eyebrow">Lokale Daten</span>
            <h2>Korrekturen sichern</h2>
          </div>
          <button type="button" className="icon-button" onClick={close} aria-label="Schliessen">×</button>
        </div>

        <div className="correction-summary correction-summary-stacked">
          <strong>{editedCount}</strong>
          <span>
            lokale {editedCount === 1 ? 'Korrektur' : 'Korrekturen'} auf diesem Gerät
            <small>{editedPersonCount} Personen · {editedPartnerCount} Partnerpersonen</small>
          </span>
        </div>

        <section className="correction-section">
          <h3>Export</h3>
          <p>Speichert alle lokalen Korrekturen inklusive Lebensstatus und Partnerbeziehungen als JSON-Datei. Die Datei kann persönliche Daten enthalten.</p>
          <button type="button" className="correction-primary" onClick={exportEdits} disabled={editedCount === 0}>
            Korrekturen exportieren
          </button>
        </section>

        <section className="correction-section">
          <h3>Import</h3>
          <p>Importierte Korrekturen werden mit den vorhandenen lokalen Änderungen zusammengeführt. Version-1-Sicherungen bleiben kompatibel; unbekannte Personen- und Partner-IDs werden ignoriert.</p>
          <input
            ref={inputRef}
            className="correction-file-input"
            type="file"
            accept="application/json,.json"
            onChange={(event) => void importFile(event.target.files?.[0])}
          />
        </section>

        <section className="correction-section danger-section">
          <h3>Lokale Daten zurücksetzen</h3>
          <p>Die ursprünglichen Daten aus dem Repository bleiben dabei unverändert.</p>
          <button
            type="button"
            className={`correction-reset${confirmReset ? ' is-confirming' : ''}`}
            onClick={resetAll}
            disabled={editedCount === 0}
          >
            {confirmReset ? 'Wirklich alle Korrekturen verwerfen' : 'Alle lokalen Korrekturen verwerfen'}
          </button>
        </section>

        {message && <div className="correction-message" role="status">{message}</div>}
      </aside>
    </>
  )
}
