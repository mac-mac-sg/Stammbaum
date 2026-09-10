import { useEffect, useState } from 'react'
import CorrectionDataSheet from './CorrectionDataSheet'
import InstallAppCard from './InstallAppCard'
import { useEdits } from './EditContext'
import { usePrivacy } from './PrivacyContext'

type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'stammbaum-theme-mode'

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
      <path d="M12 8.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" stroke="currentColor" strokeWidth="1.8" />
      <path d="M19.1 13.7a7.8 7.8 0 0 0 .05-1.7 7.8 7.8 0 0 0-.05-1.7l2-1.55-2-3.45-2.48 1a7.93 7.93 0 0 0-2.94-1.7L13.3 2h-4l-.38 2.6a7.93 7.93 0 0 0-2.94 1.7l-2.48-1-2 3.45 2 1.55a7.8 7.8 0 0 0-.05 1.7c0 .58.02 1.14.05 1.7l-2 1.55 2 3.45 2.48-1a7.93 7.93 0 0 0 2.94 1.7L9.3 22h4l.38-2.6a7.93 7.93 0 0 0 2.94-1.7l2.48 1 2-3.45-2-1.55Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

export default function SettingsMenu() {
  const { mode: privacyMode, setMode: setPrivacyMode } = usePrivacy()
  const { editedCount } = useEdits()
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [open, setOpen] = useState(false)
  const [correctionsOpen, setCorrectionsOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)

    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (themeColor) themeColor.content = theme === 'dark' ? '#141714' : '#f4f2ec'
  }, [theme])

  const openCorrections = () => {
    setOpen(false)
    setCorrectionsOpen(true)
  }

  return (
    <>
      <button
        type="button"
        className={`settings-backdrop${open ? ' is-open' : ''}`}
        aria-label="Einstellungen schliessen"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
      />

      <div className="settings-menu-host">
        <button
          type="button"
          className={`settings-trigger${open ? ' is-open' : ''}`}
          aria-label="Einstellungen"
          aria-expanded={open}
          aria-controls="app-settings-panel"
          onClick={() => setOpen((current) => !current)}
        >
          <SettingsIcon />
        </button>

        <section
          id="app-settings-panel"
          className={`settings-panel${open ? ' is-open' : ''}`}
          aria-label="Einstellungen"
          aria-hidden={!open}
        >
          <div className="settings-panel-header">
            <div>
              <span className="eyebrow">App</span>
              <h2>Einstellungen</h2>
            </div>
            <button type="button" className="settings-close" onClick={() => setOpen(false)} aria-label="Einstellungen schliessen">×</button>
          </div>

          <div className="settings-section">
            <div className="settings-section-heading">
              <strong>Darstellung</strong>
              <small>Farbschema</small>
            </div>
            <div className="settings-theme-options" role="group" aria-label="Farbschema wählen">
              <button
                type="button"
                className={theme === 'light' ? 'is-active' : ''}
                aria-pressed={theme === 'light'}
                onClick={() => setTheme('light')}
              >
                <span aria-hidden="true">☀</span>
                <strong>Hell</strong>
              </button>
              <button
                type="button"
                className={theme === 'dark' ? 'is-active' : ''}
                aria-pressed={theme === 'dark'}
                onClick={() => setTheme('dark')}
              >
                <span aria-hidden="true">◐</span>
                <strong>Dunkel</strong>
              </button>
            </div>
          </div>

          <div className="settings-section">
            <div className="settings-section-heading">
              <strong>Datenschutz</strong>
              <small>{privacyMode === 'protected' ? 'Schutz aktiv' : 'Vollansicht aktiv'}</small>
            </div>
            <button
              type="button"
              className={`settings-privacy-button${privacyMode === 'protected' ? ' is-protected' : ''}`}
              onClick={() => setPrivacyMode(privacyMode === 'protected' ? 'private' : 'protected')}
              aria-pressed={privacyMode === 'protected'}
            >
              <span className="settings-privacy-icon" aria-hidden="true">{privacyMode === 'protected' ? '◈' : '○'}</span>
              <span>
                <strong>{privacyMode === 'protected' ? 'Schutzmodus' : 'Vollansicht'}</strong>
                <small>{privacyMode === 'protected' ? 'Lebensdaten potenziell lebender Personen werden ausgeblendet.' : 'Alle erfassten Lebensdaten werden angezeigt.'}</small>
              </span>
              <b aria-hidden="true">›</b>
            </button>
            <p className="settings-public-note">
              Der Schutzmodus verändert nur die Darstellung. Die über GitHub Pages veröffentlichten Quelldaten sind technisch öffentlich abrufbar.
            </p>
          </div>

          <div className="settings-section">
            <div className="settings-section-heading">
              <strong>Daten & App</strong>
              <small>Gerätelokal</small>
            </div>
            <button type="button" className="settings-data-button" onClick={openCorrections}>
              <span>
                <strong>Lokale Korrekturen</strong>
                <small>{editedCount} {editedCount === 1 ? 'Änderung' : 'Änderungen'} · sichern oder importieren</small>
              </span>
              <b aria-hidden="true">›</b>
            </button>
            <div className="settings-install-wrap">
              <InstallAppCard />
            </div>
          </div>
        </section>
      </div>

      <CorrectionDataSheet open={correctionsOpen} onClose={() => setCorrectionsOpen(false)} />
    </>
  )
}
