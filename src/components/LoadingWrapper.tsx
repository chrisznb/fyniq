'use client'

import React from 'react'
import { useData } from '@/contexts/DataContext'

interface LoadingWrapperProps {
  children: React.ReactNode
}

export default function LoadingWrapper({ children }: LoadingWrapperProps) {
  const { isLoading } = useData()

  // Show loading spinner while data is being decrypted/loaded
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black mx-auto mb-4"></div>
          <p className="text-gray-600">Daten werden geladen...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}