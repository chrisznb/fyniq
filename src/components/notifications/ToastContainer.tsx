'use client'

import { useNotification } from '@/contexts/NotificationContext'
import ToastNotification from './ToastNotification'

export default function ToastContainer() {
  const { notifications } = useNotification()

  return (
    <div className="absolute bottom-13 right-7 z-50">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id}
          className="absolute bottom-0 right-0"
          style={{ zIndex: 100 + index }}
        >
          <ToastNotification notification={notification} />
        </div>
      ))}
    </div>
  )
}