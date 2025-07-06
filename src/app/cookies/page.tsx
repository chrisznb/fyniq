'use client'

import NextDynamic from 'next/dynamic'

const CookieSettingsContent = NextDynamic(() => import('./CookieSettingsContent'), {
  ssr: false,
  loading: () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
    </div>
  )
})

export default function CookieSettings() {
  return <CookieSettingsContent />
}