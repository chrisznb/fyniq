'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t-3 border-black bg-white px-3 sm:px-5 py-3 sm:py-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        <div className="text-xs sm:text-sm text-gray-600">
          © 2025 fyniq Beta
        </div>
        <nav className="flex items-center gap-3 sm:gap-6">
          <Link 
            href="/datenschutz" 
            className="text-xs sm:text-sm text-gray-600 hover:text-black transition-colors underline"
          >
            Datenschutz
          </Link>
          <Link 
            href="/impressum" 
            className="text-xs sm:text-sm text-gray-600 hover:text-black transition-colors underline"
          >
            Impressum
          </Link>
          <Link 
            href="/cookies" 
            className="text-xs sm:text-sm text-gray-600 hover:text-black transition-colors underline"
          >
            Cookie-Einstellungen
          </Link>
        </nav>
      </div>
    </footer>
  )
}