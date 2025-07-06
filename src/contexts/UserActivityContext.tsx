'use client'

import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import {
  getFeedbackTrackingData,
  incrementVisitCount,
  incrementInvoiceCount,
  shouldShowFeedbackModal,
  getActivityTracker,
  markFeedbackGiven,
  setRemindLater,
  setNeverAskAgain
} from '@/utils/feedbackTiming'

interface UserActivityContextType {
  // Feedback modal state
  shouldShowFeedback: boolean
  feedbackTrigger: 'first_invoice' | 'active_time' | 'second_visit' | 'reminder' | 'none'
  showFeedbackModal: () => void
  hideFeedbackModal: () => void
  
  // User actions
  onInvoiceCreated: () => void
  onFeedbackSubmitted: () => void
  onRemindLater: () => void
  onNeverAskAgain: () => void
  
  // Activity tracking
  totalActiveTime: number
  isUserActive: boolean
  
  // User data
  visitCount: number
  invoiceCount: number
  hasGivenFeedback: boolean
}

const UserActivityContext = createContext<UserActivityContextType | undefined>(undefined)

export function UserActivityProvider({ children }: { children: React.ReactNode }) {
  const [shouldShowFeedback, setShouldShowFeedback] = useState(false)
  const [feedbackTrigger, setFeedbackTrigger] = useState<'first_invoice' | 'active_time' | 'second_visit' | 'reminder' | 'none'>('none')
  const [totalActiveTime, setTotalActiveTime] = useState(0)
  const [isUserActive, setIsUserActive] = useState(true)
  const [visitCount, setVisitCount] = useState(1)
  const [invoiceCount, setInvoiceCount] = useState(0)
  const [hasGivenFeedback, setHasGivenFeedback] = useState(false)
  
  const activityTracker = useRef(getActivityTracker())
  const feedbackCheckInterval = useRef<NodeJS.Timeout | null>(null)
  const triggerTimeout = useRef<NodeJS.Timeout | null>(null)

  // Initialize tracking data on mount
  useEffect(() => {
    const tracker = activityTracker.current
    if (!tracker) return
    
    const data = getFeedbackTrackingData()
    setVisitCount(data.visitCount)
    setInvoiceCount(data.invoiceCount)
    setHasGivenFeedback(data.hasGivenFeedback)
    setTotalActiveTime(data.totalActiveTime)
    
    // Increment visit count for new session
    incrementVisitCount()
    
    // Start activity tracking
    tracker.startTracking()
    
    // Check for feedback triggers periodically
    feedbackCheckInterval.current = setInterval(() => {
      const result = shouldShowFeedbackModal()
      if (result.shouldShow && !shouldShowFeedback) {
        setFeedbackTrigger(result.trigger)
        
        // Schedule modal to show with appropriate delay
        if (triggerTimeout.current) {
          clearTimeout(triggerTimeout.current)
        }
        
        triggerTimeout.current = setTimeout(() => {
          setShouldShowFeedback(true)
        }, result.delay || 0)
      }
      
      // Update active time display
      setTotalActiveTime(tracker.getActiveTime())
      setIsUserActive(tracker.isActive())
    }, 1000) // Check every second
    
    return () => {
      tracker.stopTracking()
      
      if (feedbackCheckInterval.current) {
        clearInterval(feedbackCheckInterval.current)
      }
      
      if (triggerTimeout.current) {
        clearTimeout(triggerTimeout.current)
      }
    }
  }, [shouldShowFeedback])

  const showFeedbackModal = () => {
    setShouldShowFeedback(true)
  }

  const hideFeedbackModal = () => {
    setShouldShowFeedback(false)
    setFeedbackTrigger('none')
    
    if (triggerTimeout.current) {
      clearTimeout(triggerTimeout.current)
      triggerTimeout.current = null
    }
  }

  const onInvoiceCreated = () => {
    incrementInvoiceCount()
    const data = getFeedbackTrackingData()
    setInvoiceCount(data.invoiceCount)
    
    // Check if this triggers feedback modal
    const result = shouldShowFeedbackModal()
    if (result.shouldShow && result.trigger === 'first_invoice') {
      setFeedbackTrigger(result.trigger)
      
      // Show modal after delay
      if (triggerTimeout.current) {
        clearTimeout(triggerTimeout.current)
      }
      
      triggerTimeout.current = setTimeout(() => {
        setShouldShowFeedback(true)
      }, result.delay || 2500)
    }
  }

  const onFeedbackSubmitted = () => {
    markFeedbackGiven()
    setHasGivenFeedback(true)
    hideFeedbackModal()
  }

  const onRemindLater = () => {
    setRemindLater()
    hideFeedbackModal()
  }

  const onNeverAskAgain = () => {
    setNeverAskAgain()
    hideFeedbackModal()
  }

  const value: UserActivityContextType = {
    shouldShowFeedback,
    feedbackTrigger,
    showFeedbackModal,
    hideFeedbackModal,
    onInvoiceCreated,
    onFeedbackSubmitted,
    onRemindLater,
    onNeverAskAgain,
    totalActiveTime,
    isUserActive,
    visitCount,
    invoiceCount,
    hasGivenFeedback
  }

  return (
    <UserActivityContext.Provider value={value}>
      {children}
    </UserActivityContext.Provider>
  )
}

export function useUserActivity() {
  const context = useContext(UserActivityContext)
  if (context === undefined) {
    throw new Error('useUserActivity must be used within a UserActivityProvider')
  }
  return context
}