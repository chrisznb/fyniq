// Utility functions for intelligent feedback timing

export interface FeedbackTrackingData {
  hasGivenFeedback: boolean
  visitCount: number
  firstVisitTime: number
  totalActiveTime: number
  lastReminderTime?: number
  neverAskAgain: boolean
  invoiceCount: number
  firstInvoiceCreated?: boolean
  lastActivityTime: number
}

const STORAGE_KEY = 'fyniq_feedback_tracking'
const ACTIVE_TIME_THRESHOLD = 5 * 60 * 1000 // 5 minutes
const REMINDER_DELAY = 24 * 60 * 60 * 1000 // 24 hours

export function getFeedbackTrackingData(): FeedbackTrackingData {
  if (typeof window === 'undefined') {
    return getDefaultTrackingData()
  }

  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      const defaultData = getDefaultTrackingData()
      saveFeedbackTrackingData(defaultData)
      return defaultData
    }
    
    const data = JSON.parse(stored) as FeedbackTrackingData
    
    // Validate and migrate old data
    return {
      hasGivenFeedback: data.hasGivenFeedback || false,
      visitCount: data.visitCount || 1,
      firstVisitTime: data.firstVisitTime || Date.now(),
      totalActiveTime: data.totalActiveTime || 0,
      lastReminderTime: data.lastReminderTime,
      neverAskAgain: data.neverAskAgain || false,
      invoiceCount: data.invoiceCount || 0,
      firstInvoiceCreated: data.firstInvoiceCreated || false,
      lastActivityTime: data.lastActivityTime || Date.now()
    }
  } catch (error) {
    console.warn('Failed to parse feedback tracking data:', error)
    const defaultData = getDefaultTrackingData()
    saveFeedbackTrackingData(defaultData)
    return defaultData
  }
}

function getDefaultTrackingData(): FeedbackTrackingData {
  return {
    hasGivenFeedback: false,
    visitCount: 1,
    firstVisitTime: Date.now(),
    totalActiveTime: 0,
    neverAskAgain: false,
    invoiceCount: 0,
    firstInvoiceCreated: false,
    lastActivityTime: Date.now()
  }
}

export function saveFeedbackTrackingData(data: FeedbackTrackingData): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      ...data,
      lastActivityTime: Date.now()
    }))
  } catch (error) {
    console.warn('Failed to save feedback tracking data:', error)
  }
}

export function incrementVisitCount(): void {
  const data = getFeedbackTrackingData()
  const now = Date.now()
  const timeSinceLastActivity = now - data.lastActivityTime
  
  // Only increment if it's been more than 30 minutes since last activity (new session)
  if (timeSinceLastActivity > 30 * 60 * 1000) {
    data.visitCount += 1
  }
  
  saveFeedbackTrackingData(data)
}

export function incrementInvoiceCount(): void {
  const data = getFeedbackTrackingData()
  data.invoiceCount += 1
  
  if (data.invoiceCount === 1) {
    data.firstInvoiceCreated = true
  }
  
  saveFeedbackTrackingData(data)
}

export function addActiveTime(timeMs: number): void {
  const data = getFeedbackTrackingData()
  data.totalActiveTime += timeMs
  saveFeedbackTrackingData(data)
}

export function markFeedbackGiven(): void {
  const data = getFeedbackTrackingData()
  data.hasGivenFeedback = true
  saveFeedbackTrackingData(data)
}

export function setRemindLater(): void {
  const data = getFeedbackTrackingData()
  data.lastReminderTime = Date.now()
  saveFeedbackTrackingData(data)
}

export function setNeverAskAgain(): void {
  const data = getFeedbackTrackingData()
  data.neverAskAgain = true
  saveFeedbackTrackingData(data)
}

// Trigger condition checks
export function shouldShowFeedbackModal(): {
  shouldShow: boolean
  trigger: 'first_invoice' | 'active_time' | 'second_visit' | 'reminder' | 'none'
  delay?: number
} {
  const data = getFeedbackTrackingData()
  
  // Never show if user opted out or already gave feedback
  if (data.neverAskAgain || data.hasGivenFeedback) {
    return { shouldShow: false, trigger: 'none' }
  }
  
  // Primary trigger: After first invoice created
  if (data.firstInvoiceCreated && data.invoiceCount === 1) {
    return { 
      shouldShow: true, 
      trigger: 'first_invoice',
      delay: 2500 // 2.5 seconds after invoice creation
    }
  }
  
  // Fallback trigger: Time-based for first visit
  if (data.visitCount === 1 && data.totalActiveTime >= ACTIVE_TIME_THRESHOLD) {
    return { 
      shouldShow: true, 
      trigger: 'active_time',
      delay: 1000 // 1 second delay
    }
  }
  
  // Backup trigger: Second visit
  if (data.visitCount === 2) {
    return { 
      shouldShow: true, 
      trigger: 'second_visit',
      delay: 30000 // 30 seconds after second visit
    }
  }
  
  // Reminder trigger: Show again after 24 hours if user chose "remind later"
  if (data.lastReminderTime) {
    const timeSinceReminder = Date.now() - data.lastReminderTime
    if (timeSinceReminder >= REMINDER_DELAY) {
      return { 
        shouldShow: true, 
        trigger: 'reminder',
        delay: 5000 // 5 seconds delay
      }
    }
  }
  
  return { shouldShow: false, trigger: 'none' }
}

export function getActivityTracker() {
  let isActive = true
  let activeStartTime = Date.now()
  let activityTimer: NodeJS.Timeout | null = null
  
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Tab became inactive
      if (isActive) {
        const activeTime = Date.now() - activeStartTime
        addActiveTime(activeTime)
        isActive = false
      }
    } else {
      // Tab became active
      if (!isActive) {
        activeStartTime = Date.now()
        isActive = true
      }
    }
  }
  
  const handleFocus = () => {
    if (!isActive) {
      activeStartTime = Date.now()
      isActive = true
    }
  }
  
  const handleBlur = () => {
    if (isActive) {
      const activeTime = Date.now() - activeStartTime
      addActiveTime(activeTime)
      isActive = false
    }
  }
  
  const startTracking = () => {
    // Track page visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    window.addEventListener('blur', handleBlur)
    
    // Save active time every 30 seconds
    activityTimer = setInterval(() => {
      if (isActive) {
        const activeTime = Date.now() - activeStartTime
        addActiveTime(activeTime)
        activeStartTime = Date.now() // Reset start time
      }
    }, 30000)
  }
  
  const stopTracking = () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange)
    window.removeEventListener('focus', handleFocus)
    window.removeEventListener('blur', handleBlur)
    
    if (activityTimer) {
      clearInterval(activityTimer)
      activityTimer = null
    }
    
    // Save final active time
    if (isActive) {
      const activeTime = Date.now() - activeStartTime
      addActiveTime(activeTime)
    }
  }
  
  const getActiveTime = () => {
    const data = getFeedbackTrackingData()
    let currentSessionTime = 0
    
    if (isActive) {
      currentSessionTime = Date.now() - activeStartTime
    }
    
    return data.totalActiveTime + currentSessionTime
  }
  
  return {
    startTracking,
    stopTracking,
    getActiveTime,
    isActive: () => isActive
  }
}