'use client'

import { useState } from 'react'
import { ViewType } from '@/types'
import { useModal } from '@/contexts/ModalContext'
import { 
  Home, 
  FileText, 
  Users, 
  User, 
  X,
  Menu
} from 'lucide-react'

interface FloatingTabNavigationProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
  showOnboarding?: boolean
  showCookieBanner?: boolean
  showFeedbackModal?: boolean
}

const tabConfig = [
  { key: 'dashboard' as ViewType, icon: Home, label: 'Dashboard' },
  { key: 'invoices' as ViewType, icon: FileText, label: 'Rechnungen' },
  { key: 'customers' as ViewType, icon: Users, label: 'Kunden' },
  { key: 'profile' as ViewType, icon: User, label: 'Account' },
]

export default function FloatingTabNavigation({ currentView, setCurrentView, showOnboarding, showCookieBanner, showFeedbackModal }: FloatingTabNavigationProps) {
  const [isOpen, setIsOpen] = useState(false)
  const { currentModal } = useModal()

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  // Hide FAB when any modal is open, or when cookie banner/onboarding/feedback modal is shown
  const shouldHideFAB = currentModal !== null || showOnboarding || showCookieBanner || showFeedbackModal

  const handleTabSelect = (view: ViewType) => {
    setCurrentView(view)
    setIsOpen(false)
  }

  // Don't render FAB if it should be hidden
  if (shouldHideFAB) {
    return null
  }

  return (
    <>
      {/* FAB */}
      <div className="fab-container fixed left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
        <button
          onClick={toggleMenu}
          className="fab w-14 h-14 bg-[var(--accent)] border-3 border-black rounded-full flex items-center justify-center transition-all duration-200"
        >
          {isOpen ? (
            <X className="w-6 h-6 text-black" />
          ) : (
            <Menu className="w-6 h-6 text-black" />
          )}
        </button>
      </div>

      {/* Tab Menu Overlay */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Tab Menu */}
          <div className="fixed bottom-24 left-1/2 transform -translate-x-1/2 z-50 lg:hidden">
            <div className="fab-menu bg-white border-3 border-black rounded-2xl p-4 shadow-2xl max-w-xs w-[280px]">
              <div className="grid grid-cols-2 gap-3">
                {tabConfig.map(({ key, icon: Icon, label }) => (
                  <button
                    key={key}
                    onClick={() => handleTabSelect(key)}
                    className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all min-h-[70px] ${
                      currentView === key
                        ? 'bg-[var(--accent)] border-2 border-black'
                        : 'bg-gray-50 hover:bg-gray-100 border-2 border-gray-200'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      currentView === key ? 'text-black' : 'text-gray-600'
                    }`} />
                    <span className={`text-xs font-medium leading-tight text-center ${
                      currentView === key ? 'text-black' : 'text-gray-600'
                    }`}>
                      {label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}