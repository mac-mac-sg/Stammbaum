import { useEffect, useState } from 'react'
import { usePrivacy } from './PrivacyContext'

type ThemeMode = 'light' | 'dark'

const THEME_STORAGE_KEY = 'stammbaum-theme-mode'

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const stored = window.localStorage.getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export default function SettingsMenu() {
  const { mode: privacyMode, setMode: setPrivacyMode } = usePrivacy()
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
    window.localStorage.setItem(THEME_STORAGE_KEY, theme)

    const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    if (themeColor) themeColor.content = theme === 'dark' ? '#141714' : '#f4f2ec'
  }, [theme])

  return (
    <>
      {open && (
        <button
          type="button"
          className="settings-backdrop"
          aria-label="Einstellungen schliessen"
          onClick={() => setOpen(false)}
        />
      )}

      <div className="settings-menu-host">
        <button
          type="button"
          className={`settings-trigger${open ? ' is-open' : ''}`}
          aria-label="Einstellungen"
          aria-expanded={open}
          aria-controls="app-settings-panel"
          onClick={() => setOpen((current) => !current)}
        >
          <span aria-hidden="true">⚙</span>
        </button>

        {open && (
          <section id="app-settings-panel" className="settings-panel" aria-label="Einstellungen">
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
                <strong>Privacy</strong>
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
                  <small>{privacyMode === 'protected' ? 'Lebensdaten potenziell lebender Personen sind verborgen.' : 'Alle erfassten Lebensdaten werden angezeigt.'}</small>
                </span>
                <b aria-hidden="true">›</b>
              </button>
            </div>
          </section>
        )}
      </div>
    </>
  )
}
