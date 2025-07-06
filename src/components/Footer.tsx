'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="border-t-3 border-black bg-white px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          © 2025 fyniq Beta
        </div>
        <nav className="flex items-center gap-6">
          <Link 
            href="/datenschutz" 
            className="text-sm text-gray-600 hover:text-black transition-colors underline"
          >
            Datenschutz
          </Link>
          <Link 
            href="/impressum" 
            className="text-sm text-gray-600 hover:text-black transition-colors underline"
          >
            Impressum
          </Link>
          <Link 
            href="/cookies" 
            className="text-sm text-gray-600 hover:text-black transition-colors underline"
          >
            Cookie-Einstellungen
          </Link>
        </nav>
      </div>
    </footer>
  )
}