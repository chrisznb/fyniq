'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import AppContainer from '@/components/AppContainer'
import Header from '@/components/Header'
import { useConsent } from '@/contexts/ConsentContext'
import { useNotification } from '@/contexts/NotificationContext'

function CookieSettingsContent() {
  const { consentSettings, updateConsent, revokeConsent } = useConsent()
  const { showSuccess } = useNotification()
  const [localData, setLocalData] = useState<{ key: string; size: number }[]>([])
  
  const [settings, setSettings] = useState({
    necessary: true,
    analytics: false,
    preferences: false
  })

  useEffect(() => {
    if (consentSettings) {
      setSettings({
        necessary: true,
        analytics: consentSettings.analytics,
        preferences: consentSettings.preferences
      })
    }
    
    // Analysiere localStorage
    const data: { key: string; size: number }[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        const value = localStorage.getItem(key) || ''
        data.push({
          key,
          size: new Blob([value]).size
        })
      }
    }
    setLocalData(data.sort((a, b) => b.size - a.size))
  }, [consentSettings])

  const handleSave = () => {
    updateConsent({
      analytics: settings.analytics,
      preferences: settings.preferences
    })
    showSuccess('Cookie-Einstellungen wurden gespeichert')
  }

  const handleDeleteAll = async () => {
    const confirmed = confirm('Alle Daten löschen?\n\nMöchten Sie wirklich alle gespeicherten Daten löschen? Dies umfasst alle Rechnungen, Kunden und Einstellungen. Diese Aktion kann nicht rückgängig gemacht werden.')
    
    if (confirmed) {
      // Lösche alle localStorage Daten außer Cookie-Zustimmung
      const consentBackup = localStorage.getItem('cookieConsent')
      localStorage.clear()
      if (consentBackup) {
        localStorage.setItem('cookieConsent', consentBackup)
      }
      showSuccess('Alle Daten wurden gelöscht')
      setTimeout(() => {
        window.location.href = '/'
      }, 1500)
    }
  }

  const handleExportData = () => {
    const allData: Record<string, unknown> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key) {
        try {
          allData[key] = JSON.parse(localStorage.getItem(key) || '{}')
        } catch {
          allData[key] = localStorage.getItem(key)
        }
      }
    }
    
    const dataStr = JSON.stringify(allData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `fyniq-daten-export-${new Date().toISOString().split('T')[0]}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    showSuccess('Daten wurden exportiert')
  }

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const totalSize = localData.reduce((sum, item) => sum + item.size, 0)

  return (
    <AppContainer>
      <Header currentView="dashboard" setCurrentView={() => {}} />
      <main className="p-5 flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/" className="text-blue-600 hover:underline text-sm">
              ← Zurück zur App
            </Link>
          </div>
          
          <h1 className="text-3xl font-bold mb-6">Cookie- & Datenschutz-Einstellungen</h1>
          
          <div className="space-y-8">
            <section className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200">
              <h2 className="text-xl font-bold mb-4">Cookie-Einstellungen</h2>
              
              <div className="space-y-4">
                <div className="flex items-start justify-between p-4 bg-white rounded border">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Notwendige Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Diese Cookies sind für die Grundfunktionen der App erforderlich und können nicht deaktiviert werden.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={true}
                    disabled
                    className="mt-1 w-5 h-5 text-black"
                  />
                </div>

                <div className="flex items-start justify-between p-4 bg-white rounded border">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Analyse-Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Helfen uns zu verstehen, wie die App genutzt wird, um sie zu verbessern.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.analytics}
                    onChange={(e) => setSettings({ ...settings, analytics: e.target.checked })}
                    className="mt-1 w-5 h-5 text-black accent-black"
                  />
                </div>

                <div className="flex items-start justify-between p-4 bg-white rounded border">
                  <div className="flex-1">
                    <h3 className="font-semibold mb-1">Präferenz-Cookies</h3>
                    <p className="text-sm text-gray-600">
                      Speichern Ihre persönlichen Einstellungen und Präferenzen.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.preferences}
                    onChange={(e) => setSettings({ ...settings, preferences: e.target.checked })}
                    className="mt-1 w-5 h-5 text-black accent-black"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleSave}
                  className="px-6 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors"
                >
                  Einstellungen speichern
                </button>
                <button
                  onClick={revokeConsent}
                  className="px-6 py-2 border-2 border-gray-300 rounded hover:border-black transition-colors"
                >
                  Zustimmung widerrufen
                </button>
              </div>
            </section>

            <section className="bg-blue-50 p-6 rounded-lg border-2 border-blue-200">
              <h2 className="text-xl font-bold mb-4">Gespeicherte Daten</h2>
              
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Gesamtgröße der gespeicherten Daten: <strong>{formatBytes(totalSize)}</strong>
                </p>
              </div>

              <div className="space-y-2 mb-6">
                <h3 className="font-semibold text-sm">Datenübersicht:</h3>
                <div className="max-h-60 overflow-y-auto bg-white p-3 rounded border">
                  {localData.map((item) => (
                    <div key={item.key} className="flex justify-between py-1 text-sm">
                      <span className="font-mono">{item.key}</span>
                      <span className="text-gray-600">{formatBytes(item.size)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  onClick={handleExportData}
                  className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Alle Daten exportieren
                </button>
                <button
                  onClick={handleDeleteAll}
                  className="px-6 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                >
                  Alle Daten löschen
                </button>
              </div>
            </section>

            <section className="bg-yellow-50 p-6 rounded-lg border-2 border-yellow-200">
              <h2 className="text-xl font-bold mb-4">Wichtige Informationen</h2>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Alle Ihre Daten werden ausschließlich lokal in Ihrem Browser gespeichert</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Es findet keine Übertragung an externe Server statt</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Sie haben jederzeit die volle Kontrolle über Ihre Daten</span>
                </li>
                <li className="flex items-start">
                  <span className="mr-2">•</span>
                  <span>Bei der Löschung der Browserdaten werden auch Ihre fyniq-Daten gelöscht</span>
                </li>
              </ul>
            </section>
          </div>
        </div>
      </main>
    </AppContainer>
  )
}

export const dynamic = 'force-dynamic'

export default function CookieSettings() {
  return <CookieSettingsContent />
}