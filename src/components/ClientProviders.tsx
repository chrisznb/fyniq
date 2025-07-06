'use client'

import { useEffect, useState } from 'react'
import { ConsentProvider } from '@/contexts/ConsentContext'
import { DataProvider } from '@/contexts/DataContext'
import { NotificationProvider } from '@/contexts/NotificationContext'
import { UserActivityProvider } from '@/contexts/UserActivityContext'
import { ModalProvider } from '@/contexts/ModalContext'
import LoadingWrapper from '@/components/LoadingWrapper'

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // During SSR and before hydration, render children without providers
  if (!isHydrated) {
    return <div suppressHydrationWarning>{children}</div>
  }

  // After hydration, render with all providers
  return (
    <ConsentProvider>
      <DataProvider>
        <LoadingWrapper>
          <NotificationProvider>
            <UserActivityProvider>
              <ModalProvider>
                {children}
              </ModalProvider>
            </UserActivityProvider>
          </NotificationProvider>
        </LoadingWrapper>
      </DataProvider>
    </ConsentProvider>
  )
}