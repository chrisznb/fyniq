'use client'

import { useEffect, useState } from 'react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel: () => void
  type?: 'danger' | 'warning' | 'info'
}

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Bestätigen',
  cancelText = 'Abbrechen',
  onConfirm,
  onCancel,
  type = 'danger'
}: ConfirmDialogProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    }
  }, [isOpen])

  if (!isOpen) return null

  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '⚠'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ℹ'
      default:
        return '⚠'
    }
  }

  const getConfirmButtonStyle = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-500 hover:bg-red-600 text-white'
      case 'warning':
        return 'bg-yellow-500 hover:bg-yellow-600 text-black'
      case 'info':
        return 'bg-blue-500 hover:bg-blue-600 text-white'
      default:
        return 'bg-red-500 hover:bg-red-600 text-white'
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4 z-50" style={{ backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div 
        className={`
          transform transition-all duration-300 ease-out
          ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}
          bg-white border-3 border-black rounded-lg p-6 w-full max-w-md
          shadow-2xl
        `}
      >
        <div className="flex items-start gap-4 mb-6">
          <div className="flex-shrink-0 text-2xl">
            {getIcon()}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-700">{message}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 px-4 py-3 border-3 border-black rounded-lg font-semibold transition-colors ${getConfirmButtonStyle()}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}