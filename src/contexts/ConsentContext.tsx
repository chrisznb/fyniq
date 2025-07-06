'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface ConsentSettings {
  necessary: boolean
  analytics: boolean
  preferences: boolean
  timestamp: string
}

interface ConsentContextType {
  hasConsent: boolean
  consentSettings: ConsentSettings | null
  acceptAll: () => void
  acceptNecessary: () => void
  updateConsent: (settings: Partial<ConsentSettings>) => void
  revokeConsent: () => void
  showBanner: boolean
  setShowBanner: (show: boolean) => void
}

const ConsentContext = createContext<ConsentContextType | undefined>(undefined)

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consentSettings, setConsentSettings] = useState<ConsentSettings | null>(null)
  const [showBanner, setShowBanner] = useState(false)
  const [isInitialized, setIsInitialized] = useState(false)

  useEffect(() => {
    const storedConsent = localStorage.getItem('cookieConsent')
    if (storedConsent) {
      try {
        setConsentSettings(JSON.parse(storedConsent))
      } catch (error) {
        console.error('Error parsing consent settings:', error)
        setShowBanner(true)
      }
    } else {
      setShowBanner(true)
    }
    setIsInitialized(true)
  }, [])

  const saveConsent = (settings: ConsentSettings) => {
    setConsentSettings(settings)
    localStorage.setItem('cookieConsent', JSON.stringify(settings))
    setShowBanner(false)
  }

  const acceptAll = () => {
    const settings: ConsentSettings = {
      necessary: true,
      analytics: true,
      preferences: true,
      timestamp: new Date().toISOString()
    }
    saveConsent(settings)
  }

  const acceptNecessary = () => {
    const settings: ConsentSettings = {
      necessary: true,
      analytics: false,
      preferences: false,
      timestamp: new Date().toISOString()
    }
    saveConsent(settings)
  }

  const updateConsent = (newSettings: Partial<ConsentSettings>) => {
    const settings: ConsentSettings = {
      necessary: true,
      analytics: newSettings.analytics ?? consentSettings?.analytics ?? false,
      preferences: newSettings.preferences ?? consentSettings?.preferences ?? false,
      timestamp: new Date().toISOString()
    }
    saveConsent(settings)
  }

  const revokeConsent = () => {
    localStorage.removeItem('cookieConsent')
    setConsentSettings(null)
    setShowBanner(true)
  }

  if (!isInitialized) {
    return <>{children}</>
  }

  return (
    <ConsentContext.Provider 
      value={{
        hasConsent: !!consentSettings,
        consentSettings,
        acceptAll,
        acceptNecessary,
        updateConsent,
        revokeConsent,
        showBanner,
        setShowBanner
      }}
    >
      {children}
    </ConsentContext.Provider>
  )
}

export const useConsent = () => {
  const context = useContext(ConsentContext)
  if (!context) {
    throw new Error('useConsent must be used within a ConsentProvider')
  }
  return context
}