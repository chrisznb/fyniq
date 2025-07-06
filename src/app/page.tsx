'use client'

import { useState, useEffect } from 'react'
import OnboardingModal from '@/components/OnboardingModal'
import AppContainer from '@/components/AppContainer'
import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import InvoicesView from '@/components/InvoicesView'
import CustomersView from '@/components/CustomersView'
import ProfileView from '@/components/ProfileView'
import InvoicePreview from '@/components/InvoicePreview'
import { DataProvider } from '@/contexts/DataContext'
import { ModalProvider } from '@/contexts/ModalContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { UserActivityProvider } from '@/contexts/UserActivityContext'
import ModalPortal from '@/components/ModalPortal'
import ToastContainer from '@/components/notifications/ToastContainer'
import FeedbackModal from '@/components/FeedbackModal'
import { useUserActivity } from '@/contexts/UserActivityContext'

function IntelligentFeedbackModal() {
  const { shouldShowFeedback, hideFeedbackModal } = useUserActivity()
  
  return (
    <FeedbackModal 
      isOpen={shouldShowFeedback} 
      onClose={hideFeedbackModal} 
    />
  )
}

export default function Home() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [currentView, setCurrentView] = useState<'dashboard' | 'invoices' | 'customers' | 'profile' | 'invoice-preview'>('dashboard')

  useEffect(() => {
    // Prüfe beim ersten Laden der App, ob Onboarding bereits gesehen wurde
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding')
    if (!hasSeenOnboarding) {
      // Kleine Verzögerung für bessere UX
      setTimeout(() => {
        setShowOnboarding(true)
      }, 300)
    }
  }, [])

  const handleCloseOnboarding = () => {
    setShowOnboarding(false)
  }

  return (
    <DataProvider>
      <NotificationProvider>
        <UserActivityProvider>
          <ModalProvider>
            <div className="relative">
              <AppContainer>
                <Header currentView={currentView} setCurrentView={setCurrentView} />
                <main className="p-5 flex-1 overflow-hidden flex flex-col">
                  {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
                  {currentView === 'invoices' && <InvoicesView setCurrentView={setCurrentView} />}
                  {currentView === 'customers' && <CustomersView />}
                  {currentView === 'profile' && <ProfileView />}
                  {currentView === 'invoice-preview' && <InvoicePreview setCurrentView={setCurrentView} />}
                </main>
              </AppContainer>
            </div>
            
            {/* Modals rendered outside AppContainer to avoid overflow issues */}
            <ModalPortal />
            
            {/* Onboarding Modal */}
            <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />
            
            {/* Intelligent Feedback Modal */}
            <IntelligentFeedbackModal />
            
            {/* Toast notifications */}
            <ToastContainer />
          </ModalProvider>
        </UserActivityProvider>
      </NotificationProvider>
    </DataProvider>
  )
}