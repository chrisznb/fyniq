import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ViewType } from '@/types'
import { MessageCircle } from 'lucide-react'
import { useUserActivity } from '@/contexts/UserActivityContext'

interface HeaderProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
}

function FeedbackButton() {
  const [isHydrated, setIsHydrated] = useState(false)
  
  // ALWAYS call the hook, even during SSR
  let showFeedbackModal = () => {}
  try {
    const userActivity = useUserActivity()
    showFeedbackModal = userActivity.showFeedbackModal
  } catch {
    // Hook will fail during SSR or before provider loads
    showFeedbackModal = () => {}
  }
  
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  return (
    <button 
      onClick={isHydrated ? showFeedbackModal : undefined}
      className="px-3 py-2 text-sm font-semibold border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1 sm:gap-2"
      title="Feedback geben"
    >
      <MessageCircle className="w-4 h-4" />
      <span className="hidden sm:inline">Feedback</span>
    </button>
  )
}

export default function Header({ currentView, setCurrentView }: HeaderProps) {

  return (
    <header className="p-3 sm:p-4 text-xl sm:text-2xl font-bold border-b-3 border-black">
      <div className="flex items-center justify-between flex-wrap gap-2 sm:gap-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <Image src="/fyniq-logo.png" alt="fyniq logo" width={24} height={24} className="sm:w-7 sm:h-7" />
          <span>fyniq</span>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-4">
          <nav className="hidden lg:flex gap-1 text-sm sm:text-base font-semibold overflow-x-auto scrollbar-hide">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 transition-all whitespace-nowrap ${
                currentView === 'dashboard'
                  ? 'bg-[var(--accent)] border-3 border-black border-b-4 border-b-black rounded-t-lg'
                  : 'border-3 border-transparent hover:bg-[rgba(245,238,168,0.3)]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('invoices')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 transition-all whitespace-nowrap ${
                currentView === 'invoices'
                  ? 'bg-[var(--accent)] border-3 border-black border-b-4 border-b-black rounded-t-lg'
                  : 'border-3 border-transparent hover:bg-[rgba(245,238,168,0.3)]'
              }`}
            >
              Rechnungen
            </button>
            <button
              onClick={() => setCurrentView('customers')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 transition-all whitespace-nowrap ${
                currentView === 'customers'
                  ? 'bg-[var(--accent)] border-3 border-black border-b-4 border-b-black rounded-t-lg'
                  : 'border-3 border-transparent hover:bg-[rgba(245,238,168,0.3)]'
              }`}
            >
              Kunden
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`px-3 sm:px-5 py-2 sm:py-2.5 transition-all whitespace-nowrap ${
                currentView === 'profile'
                  ? 'bg-[var(--accent)] border-3 border-black border-b-4 border-b-black rounded-t-lg'
                  : 'border-3 border-transparent hover:bg-[rgba(245,238,168,0.3)]'
              }`}
            >
              Account
            </button>
          </nav>
          
          <FeedbackButton />
        </div>
      </div>
    </header>
  )
}