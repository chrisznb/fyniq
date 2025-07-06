import { ViewType } from '@/types'
import { MessageCircle } from 'lucide-react'
import { useUserActivity } from '@/contexts/UserActivityContext'

interface HeaderProps {
  currentView: ViewType
  setCurrentView: (view: ViewType) => void
}

export default function Header({ currentView, setCurrentView }: HeaderProps) {
  const { showFeedbackModal } = useUserActivity()

  return (
    <header className="p-4 text-2xl font-bold flex items-center justify-between border-b-3 border-black flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <img src="/fyniq-logo.png" alt="fyniq logo" className="h-7 w-auto" />
          <span>fyniq</span>
        </div>
        
        <div className="flex items-center gap-4">
          <nav className="flex gap-1 text-base font-semibold flex-wrap">
            <button
              onClick={() => setCurrentView('dashboard')}
              className={`px-5 py-2.5 transition-all ${
                currentView === 'dashboard'
                  ? 'bg-[var(--accent)] border-3 border-black border-b-4 border-b-black rounded-t-lg'
                  : 'border-3 border-transparent hover:bg-[rgba(245,238,168,0.3)]'
              }`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setCurrentView('invoices')}
              className={`px-5 py-2.5 transition-all ${
                currentView === 'invoices'
                  ? 'bg-[var(--accent)] border-3 border-black border-b-4 border-b-black rounded-t-lg'
                  : 'border-3 border-transparent hover:bg-[rgba(245,238,168,0.3)]'
              }`}
            >
              Rechnungen
            </button>
            <button
              onClick={() => setCurrentView('customers')}
              className={`px-5 py-2.5 transition-all ${
                currentView === 'customers'
                  ? 'bg-[var(--accent)] border-3 border-black border-b-4 border-b-black rounded-t-lg'
                  : 'border-3 border-transparent hover:bg-[rgba(245,238,168,0.3)]'
              }`}
            >
              Kunden
            </button>
            <button
              onClick={() => setCurrentView('profile')}
              className={`px-5 py-2.5 transition-all ${
                currentView === 'profile'
                  ? 'bg-[var(--accent)] border-3 border-black border-b-4 border-b-black rounded-t-lg'
                  : 'border-3 border-transparent hover:bg-[rgba(245,238,168,0.3)]'
              }`}
            >
              Account
            </button>
          </nav>
          
          <button
            onClick={showFeedbackModal}
            className="px-4 py-2 text-sm font-semibold border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
            title="Feedback geben"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">Feedback</span>
          </button>
        </div>
      </header>
  )
}