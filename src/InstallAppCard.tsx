import { useEffect, useState } from 'react'

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>
}

type NavigatorWithStandalone = Navigator & { standalone?: boolean }

function isStandalone() {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(display-mode: standalone)').matches || Boolean((navigator as NavigatorWithStandalone).standalone)
}

function isIosDevice() {
  if (typeof navigator === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent)
}

function isSecureDeployment() {
  if (typeof window === 'undefined') return false
  return window.location.protocol === 'https:'
}

export default function InstallAppCard() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(isStandalone)
  const ios = isIosDevice()

  useEffect(() => {
    const handlePrompt = (event: Event) => {
      event.preventDefault()
      setInstallPrompt(event as InstallPromptEvent)
    }
    const handleInstalled = () => {
      setInstalled(true)
      setInstallPrompt(null)
    }

    window.addEventListener('beforeinstallprompt', handlePrompt)
    window.addEventListener('appinstalled', handleInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', handlePrompt)
      window.removeEventListener('appinstalled', handleInstalled)
    }
  }, [])

  if (installed || !isSecureDeployment() || (!installPrompt && !ios)) return null

  const install = async () => {
    if (!installPrompt) return
    await installPrompt.prompt()
    const choice = await installPrompt.userChoice
    if (choice.outcome === 'accepted') setInstalled(true)
    setInstallPrompt(null)
  }

  return (
    <section className="install-card" aria-label="App installieren">
      <div className="install-icon" aria-hidden="true">⌂</div>
      <div className="install-copy">
        <span className="eyebrow">Auf dem Smartphone</span>
        <strong>Stammbaum als App verwenden</strong>
        {installPrompt ? (
          <small>Zum Homescreen hinzufügen und nach dem ersten Laden auch mit instabiler Verbindung öffnen.</small>
        ) : (
          <small>In Safari über Teilen → «Zum Home-Bildschirm» hinzufügen.</small>
        )}
      </div>
      {installPrompt && (
        <button type="button" onClick={() => void install()}>Installieren</button>
      )}
    </section>
  )
}
