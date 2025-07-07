'use client'

import { useNotification } from '@/contexts/NotificationContext'
import ToastNotification from './ToastNotification'

export default function ToastContainer() {
  const { notifications } = useNotification()

  return (
    <div className="fixed top-4 right-4 z-[9998] pointer-events-none">
      {notifications.map((notification, index) => (
        <div 
          key={notification.id}
          className="mb-3 pointer-events-auto"
          style={{ zIndex: 9998 + index }}
        >
          <ToastNotification notification={notification} />
        </div>
      ))}
    </div>
  )
}