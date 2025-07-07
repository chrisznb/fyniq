'use client'

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { getFirstName } from '@/utils/helpers'
import { useNotification } from '@/contexts/NotificationContext'
import Link from 'next/link'

export default function ProfileView() {
  const { profile, setProfile } = useData()
  const { showSuccess } = useNotification()
  const [currentView, setCurrentView] = useState<'menu' | 'edit' | 'settings' | 'imprint' | 'privacy' | 'data'>('menu')
  const [formData, setFormData] = useState(profile)

  const firstName = getFirstName(profile.companyName)
  const avatarLetter = firstName ? firstName.charAt(0).toUpperCase() : 'U'

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault()
    setProfile(formData)
    setCurrentView('menu')
  }

  const renderCurrentView = () => {
    switch (currentView) {
      case 'menu':
        return renderMenu()
      case 'edit':
        return renderEdit()
      case 'settings':
        return renderInfoPage('Einstellungen', 'Einstellungen werden in einer zukünftigen Version verfügbar sein.')
      case 'imprint':
        return renderInfoPage('Impressum', 'Hier würde dein Impressum stehen. Bitte ergänze diese Informationen entsprechend den gesetzlichen Anforderungen.')
      case 'privacy':
        return renderInfoPage('Datenschutz', 'Hier würde deine Datenschutzerklärung stehen. Bitte ergänze diese Informationen entsprechend der DSGVO.')
      case 'data':
        return renderDataManagement()
      default:
        return renderMenu()
    }
  }

  const renderMenu = () => (
    <div className="w-full h-full flex flex-col">
      {/* Profile Header */}
      <div className="text-center mb-6 sm:mb-8 flex-shrink-0">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-[var(--accent)] border-3 border-black rounded-full flex items-center justify-center text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
          {avatarLetter}
        </div>
        <h2 className="text-xl sm:text-2xl font-bold">{profile.companyName || 'Dein Name'}</h2>
        <p className="text-base sm:text-lg text-[var(--muted)]">{profile.companyEmail || 'deine@email.de'}</p>
      </div>

      {/* Menu Sections */}
      <div className="space-y-4 sm:space-y-6 flex-1 overflow-y-auto">
        <div className="border-3 border-black rounded-lg p-4 sm:p-6 bg-white">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Profil</h3>
          <div className="space-y-2 sm:space-y-3">
            <button
              onClick={() => setCurrentView('edit')}
              className="w-full flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors text-base sm:text-lg"
            >
              <span>Profil bearbeiten</span>
              <span className="text-xl">→</span>
            </button>
            <button
              onClick={() => setCurrentView('settings')}
              className="w-full flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors text-base sm:text-lg"
            >
              <span>Einstellungen</span>
              <span className="text-xl">→</span>
            </button>
          </div>
        </div>

        <div className="border-3 border-black rounded-lg p-6 bg-white">
          <h3 className="text-xl font-semibold mb-4">Datenschutz & Sicherheit</h3>
          <div className="space-y-3">
            <button
              onClick={() => setCurrentView('data')}
              className="w-full flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors text-base sm:text-lg"
            >
              <span>Datenmanagement</span>
              <span className="text-xl">→</span>
            </button>
            <Link
              href="/datenschutz"
              className="w-full flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors text-base sm:text-lg"
            >
              <span>Datenschutz</span>
              <span className="text-xl">→</span>
            </Link>
            <Link
              href="/cookies"
              className="w-full flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors text-base sm:text-lg"
            >
              <span>Cookie-Einstellungen</span>
              <span className="text-xl">→</span>
            </Link>
          </div>
        </div>

        <div className="border-3 border-black rounded-lg p-6 bg-white">
          <h3 className="text-xl font-semibold mb-4">Rechtliches</h3>
          <div className="space-y-3">
            <Link
              href="/impressum"
              className="w-full flex justify-between items-center p-3 sm:p-4 hover:bg-gray-50 rounded-lg transition-colors text-base sm:text-lg"
            >
              <span>Impressum</span>
              <span className="text-xl">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )

  const renderEdit = () => (
    <div className="w-full h-full flex flex-col overflow-hidden">
      <div className="flex items-center mb-6 flex-shrink-0">
        <button
          onClick={() => setCurrentView('menu')}
          className="text-3xl mr-5 hover:text-gray-600"
        >
          ←
        </button>
        <h2 className="text-3xl font-bold">Profil bearbeiten</h2>
      </div>

      <form onSubmit={handleSaveProfile} className="flex-1 overflow-y-auto space-y-6">
        {/* Basic Info */}
        <div className="border-3 border-black rounded-lg p-6 bg-white">
          <h3 className="text-xl font-semibold mb-5">Grunddaten</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-base font-medium mb-3">Unternehmensname</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => setFormData(prev => ({ ...prev, companyName: e.target.value }))}
                className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="Max Mustermann"
                required
              />
            </div>
            
            <div>
              <label className="block text-base font-medium mb-3">Straße und Hausnummer</label>
              <input
                type="text"
                value={formData.companyStreet}
                onChange={(e) => setFormData(prev => ({ ...prev, companyStreet: e.target.value }))}
                className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="Musterstraße 1"
                required
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-5">
              <div>
                <label className="block text-base font-medium mb-3">PLZ</label>
                <input
                  type="text"
                  value={formData.companyZip}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyZip: e.target.value }))}
                  className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                  placeholder="12345"
                  required
                />
              </div>
              <div>
                <label className="block text-base font-medium mb-3">Stadt</label>
                <input
                  type="text"
                  value={formData.companyCity}
                  onChange={(e) => setFormData(prev => ({ ...prev, companyCity: e.target.value }))}
                  className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                  placeholder="Musterstadt"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-base font-medium mb-3">E-Mail</label>
              <input
                type="email"
                value={formData.companyEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, companyEmail: e.target.value }))}
                className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="info@musterunternehmen.de"
                required
              />
            </div>
            
            <div>
              <label className="block text-base font-medium mb-3">Telefon (optional)</label>
              <input
                type="tel"
                value={formData.companyPhone || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, companyPhone: e.target.value }))}
                className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="+49 123 456789"
              />
            </div>
          </div>
        </div>

        {/* Tax Information */}
        <div className="border-3 border-black rounded-lg p-6 bg-white">
          <h3 className="text-xl font-semibold mb-5">Steuer-Informationen</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-base font-medium mb-3">Steuernummer</label>
              <input
                type="text"
                value={formData.taxNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, taxNumber: e.target.value }))}
                className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="12/345/67890"
                required
              />
            </div>
            
            <div>
              <label className="block text-base font-medium mb-3">Umsatzsteuer-ID (optional)</label>
              <input
                type="text"
                value={formData.vatId || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, vatId: e.target.value }))}
                className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="DE123456789"
              />
            </div>
            
            <div>
              <label className="block text-base font-medium mb-3">Steuerhinweis für Rechnungen</label>
              <select
                value={formData.taxNotice}
                onChange={(e) => setFormData(prev => ({ ...prev, taxNotice: e.target.value }))}
                className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                required
              >
                <option value="">Bitte auswählen...</option>
                <option value="Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.">
                  Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.
                </option>
                <option value="Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG.">
                  Kein Ausweis von Umsatzsteuer, da Kleinunternehmer gemäß § 19 UStG.
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Bank Information */}
        <div className="border-3 border-black rounded-lg p-6 bg-white">
          <h3 className="text-xl font-semibold mb-5">Bankverbindung</h3>
          <div className="space-y-5">
            <div>
              <label className="block text-base font-medium mb-3">Bank</label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bankName: e.target.value }))}
                className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="Musterbank"
              />
            </div>
            
            <div>
              <label className="block text-base font-medium mb-3">IBAN</label>
              <input
                type="text"
                value={formData.bankIban || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bankIban: e.target.value }))}
                className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="DE12 3456 7890 1234 5678 90"
              />
            </div>
            
            <div>
              <label className="block text-base font-medium mb-3">BIC</label>
              <input
                type="text"
                value={formData.bankBic || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, bankBic: e.target.value }))}
                className="w-full p-4 text-base border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="MUSTDE12"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-6 pt-6 pb-8">
          <button
            type="button"
            onClick={() => setCurrentView('menu')}
            className="flex-1 px-8 py-4 text-lg border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Abbrechen
          </button>
          <button
            type="submit"
            className="flex-1 px-8 py-4 text-lg bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Speichern
          </button>
        </div>
      </form>
    </div>
  )

  const renderInfoPage = (title: string, content: string) => (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center mb-6 flex-shrink-0">
        <button
          onClick={() => setCurrentView('menu')}
          className="text-3xl mr-5 hover:text-gray-600"
        >
          ←
        </button>
        <h2 className="text-3xl font-bold">{title}</h2>
      </div>
      
      <div className="border-3 border-black rounded-lg p-6 bg-white flex-1 overflow-y-auto">
        <div className="prose max-w-none text-lg">
          <p>{content}</p>
        </div>
      </div>
    </div>
  )

  const renderDataManagement = () => {
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
      
      showSuccess('Daten wurden erfolgreich exportiert')
    }

    const handleDeleteAll = async () => {
      const confirmed = confirm('Alle Daten löschen?\n\nMöchten Sie wirklich alle gespeicherten Daten löschen? Dies umfasst alle Rechnungen, Kunden und Einstellungen. Diese Aktion kann nicht rückgängig gemacht werden.')
      
      if (confirmed) {
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

    return (
      <div className="w-full h-full flex flex-col">
        <div className="flex items-center mb-6 flex-shrink-0">
          <button
            onClick={() => setCurrentView('menu')}
            className="text-3xl mr-5 hover:text-gray-600"
          >
            ←
          </button>
          <h2 className="text-3xl font-bold">Datenmanagement</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto space-y-6">
          <div className="border-3 border-black rounded-lg p-6 bg-blue-50">
            <h3 className="text-xl font-semibold mb-4">Datenexport</h3>
            <p className="text-gray-700 mb-4">
              Exportieren Sie alle Ihre in fyniq gespeicherten Daten als JSON-Datei. 
              Diese Datei enthält alle Rechnungen, Kunden und Einstellungen.
            </p>
            <button
              onClick={handleExportData}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              Alle Daten exportieren
            </button>
          </div>

          <div className="border-3 border-black rounded-lg p-6 bg-red-50">
            <h3 className="text-xl font-semibold mb-4">Alle Daten löschen</h3>
            <p className="text-gray-700 mb-4">
              <strong>Achtung:</strong> Diese Aktion löscht unwiderruflich alle Ihre in fyniq gespeicherten Daten. 
              Bitte erstellen Sie vorher ein Backup über den Export.
            </p>
            <button
              onClick={handleDeleteAll}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
            >
              Alle Daten unwiderruflich löschen
            </button>
          </div>

          <div className="border-3 border-black rounded-lg p-6 bg-white">
            <h3 className="text-xl font-semibold mb-4">Informationen zur Datenspeicherung</h3>
            <ul className="space-y-2 text-gray-700">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>Alle Daten werden ausschließlich lokal in Ihrem Browser gespeichert</span>
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
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8 h-full flex flex-col overflow-hidden">
      {renderCurrentView()}
    </div>
  )
}