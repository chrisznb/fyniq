'use client'

import { useEffect, useState } from 'react'
import { useNotification, Notification } from '@/contexts/NotificationContext'

interface ToastNotificationProps {
  notification: Notification
}

export default function ToastNotification({ notification }: ToastNotificationProps) {
  const { removeNotification } = useNotification()
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger slide-in animation
    const timer = setTimeout(() => setIsVisible(true), 50)
    return () => clearTimeout(timer)
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      removeNotification(notification.id)
    }, 300) // Match animation duration
  }

  const getIcon = () => {
    switch (notification.type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      case 'delete':
        return '⌫'
      default:
        return '•'
    }
  }

  const getColors = () => {
    switch (notification.type) {
      case 'success':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'error':
        return 'bg-red-50 border-red-200 text-red-800'
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 text-yellow-800'
      case 'info':
        return 'bg-blue-50 border-blue-200 text-blue-800'
      case 'delete':
        return 'bg-red-50 border-red-200 text-red-800'
      default:
        return 'bg-gray-50 border-gray-200 text-gray-800'
    }
  }

  return (
    <div
      className={`
        transform transition-all duration-300 ease-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
        ${getColors()}
        border-3 border-black rounded-lg p-4 min-w-[300px] max-w-[400px]
        shadow-lg cursor-pointer
      `}
      onClick={handleClose}
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 font-bold text-lg">
          {getIcon()}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-semibold text-sm">{notification.title}</h4>
          {notification.message && (
            <p className="text-xs mt-1 opacity-90">{notification.message}</p>
          )}
          {notification.undoAction && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                notification.undoAction!()
                handleClose()
              }}
              className="text-xs mt-2 underline font-medium"
            >
              {notification.undoText || 'Wiederherstellen'}
            </button>
          )}
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="flex-shrink-0 text-gray-500 hover:text-gray-700 font-bold text-lg leading-none"
        >
          ×
        </button>
      </div>
    </div>
  )
}