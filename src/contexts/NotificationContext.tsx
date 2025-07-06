'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'delete'
  title: string
  message?: string
  duration?: number
  undoAction?: () => void
  undoText?: string
}

interface NotificationContextType {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, 'id'>) => void
  removeNotification: (id: string) => void
  showSuccess: (title: string, message?: string) => void
  showError: (title: string, message?: string) => void
  showWarning: (title: string, message?: string) => void
  showInfo: (title: string, message?: string) => void
  showDelete: (title: string, message?: string, undoAction?: () => void, undoText?: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error('useNotification must be used within a NotificationProvider')
  }
  return context
}

interface NotificationProviderProps {
  children: ReactNode
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration || 5000
    }
    
    // Clear existing notifications when a new one appears (only keep the latest)
    setNotifications([newNotification])

    // Auto remove after duration
    setTimeout(() => {
      removeNotification(id)
    }, newNotification.duration)
  }

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const showSuccess = (title: string, message?: string) => {
    addNotification({ type: 'success', title, message })
  }

  const showError = (title: string, message?: string) => {
    addNotification({ type: 'error', title, message })
  }

  const showWarning = (title: string, message?: string) => {
    addNotification({ type: 'warning', title, message })
  }

  const showInfo = (title: string, message?: string) => {
    addNotification({ type: 'info', title, message })
  }

  const showDelete = (title: string, message?: string, undoAction?: () => void, undoText?: string) => {
    addNotification({ type: 'delete', title, message, undoAction, undoText })
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showDelete,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}