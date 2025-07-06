'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { useModal } from '@/contexts/ModalContext'
import InvoiceModal from './modals/InvoiceModal'
import CustomerModal from './modals/CustomerModal'
import DuplicateInvoiceModal from './modals/DuplicateInvoiceModal'

export default function ModalPortal() {
  const { currentModal, modalProps, closeModal } = useModal()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted || !currentModal) return null

  const modalContent = (
    <>
      {currentModal === 'invoice' && (
        <InvoiceModal 
          onClose={closeModal} 
          editInvoiceId={'editInvoiceId' in modalProps ? modalProps.editInvoiceId : null} 
        />
      )}
      {currentModal === 'customer' && (
        <CustomerModal 
          onClose={closeModal} 
          editCustomerId={'editCustomerId' in modalProps ? modalProps.editCustomerId : null} 
        />
      )}
      {currentModal === 'duplicate-invoice' && modalProps && 'sourceInvoice' in modalProps && (
        <DuplicateInvoiceModal onClose={closeModal} sourceInvoice={modalProps.sourceInvoice} />
      )}
    </>
  )

  return createPortal(modalContent, document.body)
}