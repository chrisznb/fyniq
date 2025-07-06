'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import OnboardingModal from '@/components/OnboardingModal'
import AppContainer from '@/components/AppContainer'
import Header from '@/components/Header'
import Dashboard from '@/components/Dashboard'
import InvoicesView from '@/components/InvoicesView'
import CustomersView from '@/components/CustomersView'
import ProfileView from '@/components/ProfileView'
import InvoicePreview from '@/components/InvoicePreview'
import CookieBanner from '@/components/CookieBanner'
import NoSSR from '@/components/NoSSR'
import ModalPortal from '@/components/ModalPortal'
import ToastContainer from '@/components/notifications/ToastContainer'
import FeedbackModal from '@/components/FeedbackModal'
import { ErrorBoundary } from '@/components/ErrorBoundary'
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

export const dynamic = 'force-dynamic'

function HomeContent() {
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
    <ErrorBoundary level="page">
      <div className="relative">
        <AppContainer>
          <NoSSR fallback={
            <header className="p-4 text-2xl font-bold flex items-center justify-between border-b-3 border-black flex-wrap gap-4">
              <div className="flex items-center gap-3">
                <Image src="/fyniq-logo.png" alt="fyniq logo" width={28} height={28} />
                <span>fyniq</span>
              </div>
            </header>
          }>
            <Header currentView={currentView} setCurrentView={setCurrentView} />
          </NoSSR>
          
          <main className="p-5 flex-1 overflow-hidden flex flex-col">
            <NoSSR>
              <ErrorBoundary level="component">
                {currentView === 'dashboard' && <Dashboard setCurrentView={setCurrentView} />}
                {currentView === 'invoices' && <InvoicesView setCurrentView={setCurrentView} />}
                {currentView === 'customers' && <CustomersView />}
                {currentView === 'profile' && <ProfileView />}
                {currentView === 'invoice-preview' && <InvoicePreview setCurrentView={setCurrentView} />}
              </ErrorBoundary>
            </NoSSR>
          </main>
        </AppContainer>
        
        {/* Modals rendered outside AppContainer to avoid overflow issues */}
        <NoSSR>
          <ErrorBoundary level="component">
            <ModalPortal />
            
            {/* Onboarding Modal */}
            <OnboardingModal isOpen={showOnboarding} onClose={handleCloseOnboarding} />
            
            {/* Intelligent Feedback Modal */}
            <IntelligentFeedbackModal />
            
            {/* Toast notifications */}
            <ToastContainer />
            
            {/* Cookie Banner */}
            <CookieBanner />
          </ErrorBoundary>
        </NoSSR>
      </div>
    </ErrorBoundary>
  )
}

export default function Home() {
  return <HomeContent />
}