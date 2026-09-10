import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { PrivacyMode } from './privacy'

interface PrivacyContextValue {
  mode: PrivacyMode
  setMode: (mode: PrivacyMode) => void
  toggleMode: () => void
}

const STORAGE_KEY = 'stammbaum-privacy-mode'
const PrivacyContext = createContext<PrivacyContextValue | null>(null)

function getInitialMode(): PrivacyMode {
  if (typeof window === 'undefined') return 'protected'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  return stored === 'private' || stored === 'protected' ? stored : 'protected'
}

export function PrivacyProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PrivacyMode>(getInitialMode)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, mode)
  }, [mode])

  const value = useMemo<PrivacyContextValue>(() => ({
    mode,
    setMode,
    toggleMode: () => setMode((current) => current === 'protected' ? 'private' : 'protected'),
  }), [mode])

  return <PrivacyContext.Provider value={value}>{children}</PrivacyContext.Provider>
}

export function usePrivacy() {
  const context = useContext(PrivacyContext)
  if (!context) throw new Error('usePrivacy must be used inside PrivacyProvider')
  return context
}
