'use client'

import React, { createContext, useContext, useState } from 'react'
import { Invoice } from '@/types'

type ModalType = 'invoice' | 'customer' | 'duplicate-invoice' | null

interface InvoiceModalProps {
  editInvoiceId?: number
}

interface CustomerModalProps {
  editCustomerId?: number
}

interface DuplicateInvoiceModalProps {
  sourceInvoice: Invoice
}

type ModalProps = InvoiceModalProps | CustomerModalProps | DuplicateInvoiceModalProps | Record<string, never>

interface ModalContextType {
  currentModal: ModalType
  modalProps: ModalProps
  openModal: (type: ModalType, props?: ModalProps) => void
  closeModal: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [currentModal, setCurrentModal] = useState<ModalType>(null)
  const [modalProps, setModalProps] = useState<ModalProps>({})

  const openModal = (type: ModalType, props: ModalProps = {}) => {
    setCurrentModal(type)
    setModalProps(props)
  }

  const closeModal = () => {
    setCurrentModal(null)
    setModalProps({})
  }

  return (
    <ModalContext.Provider value={{
      currentModal,
      modalProps,
      openModal,
      closeModal,
    }}>
      {children}
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}