'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useConsent } from '@/contexts/ConsentContext'

export default function CookieBanner() {
  const [isHydrated, setIsHydrated] = useState(false)
  
  // ALWAYS call the hook to maintain hook order
  let showBanner = false
  let acceptAll = () => {}
  let acceptNecessary = () => {}
  
  try {
    const consent = useConsent()
    showBanner = consent.showBanner
    acceptAll = consent.acceptAll
    acceptNecessary = consent.acceptNecessary
  } catch {
    // Hook will fail during SSR or before provider loads
    showBanner = false
    acceptAll = () => {}
    acceptNecessary = () => {}
  }
  
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Don't render during SSR or before hydration
  if (!isHydrated) return null
  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white border-t-3 border-black shadow-lg">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-2">Cookie-Einstellungen</h3>
            <p className="text-sm text-gray-600">
              Wir nutzen Cookies und localStorage, um deine Daten lokal zu speichern und die App-Funktionalität zu gewährleisten. 
              Deine Daten bleiben auf deinem Gerät und werden nicht an Server übertragen. 
              <Link href="/datenschutz" className="underline ml-1">Mehr erfahren</Link>
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
            <button
              onClick={acceptNecessary}
              className="px-4 py-2 bg-white border-2 border-black rounded hover:bg-gray-100 transition-colors font-medium"
            >
              Nur notwendige
            </button>
            <button
              onClick={acceptAll}
              className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors font-medium"
            >
              Alle akzeptieren
            </button>
            <Link
              href="/cookies"
              className="px-4 py-2 text-center border-2 border-gray-300 rounded hover:border-black transition-colors font-medium"
            >
              Anpassen
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}