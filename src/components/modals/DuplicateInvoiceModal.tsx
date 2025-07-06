'use client'

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { useModal } from '@/contexts/ModalContext'
import { useNotification } from '@/contexts/NotificationContext'
import { generateInvoiceNumber, calculateDueDate } from '@/utils/helpers'
import { Invoice } from '@/types'

interface DuplicateInvoiceModalProps {
  onClose: () => void
  sourceInvoice: Invoice
}

export default function DuplicateInvoiceModal({ onClose, sourceInvoice }: DuplicateInvoiceModalProps) {
  const { customers, addInvoice, invoices } = useData()
  const { openModal } = useModal()
  const { showSuccess } = useNotification()
  
  const [options, setOptions] = useState({
    changeCustomer: false,
    changeDate: false,
    changeItems: false
  })

  const [formData, setFormData] = useState({
    customerId: sourceInvoice.customerId.toString(),
    date: new Date().toISOString().split('T')[0],
  })

  const handleOptionChange = (option: keyof typeof options) => {
    setOptions(prev => ({ ...prev, [option]: !prev[option] }))
  }

  const handleDuplicate = () => {
    const customer = customers.find(c => c.id === parseInt(formData.customerId))
    if (!customer) return

    // Erstelle duplizierte Rechnung
    const duplicatedInvoice: Invoice = {
      id: Date.now(),
      number: generateInvoiceNumber(customer.customerNumber, invoices),
      date: options.changeDate ? formData.date : new Date().toISOString().split('T')[0],
      dueDate: calculateDueDate(options.changeDate ? formData.date : new Date().toISOString().split('T')[0]),
      customerId: options.changeCustomer ? customer.id : sourceInvoice.customerId,
      customerName: options.changeCustomer ? customer.name : sourceInvoice.customerName,
      amount: sourceInvoice.amount,
      description: sourceInvoice.description,
      paid: false,
      items: sourceInvoice.items || []
    }

    addInvoice(duplicatedInvoice)
    showSuccess('Rechnung dupliziert', `Rechnung ${duplicatedInvoice.number} wurde erfolgreich erstellt`)
    
    onClose()
    
    // Wenn Items geändert werden sollen, Edit-Modal öffnen
    if (options.changeItems) {
      setTimeout(() => {
        openModal('invoice', { editInvoiceId: duplicatedInvoice.id })
      }, 100)
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 1000, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white border-3 border-black rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">Rechnung duplizieren</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-700 mb-4">
            Rechnung <strong>{sourceInvoice.number}</strong> wird dupliziert.
          </p>
          <p className="text-sm text-gray-600">
            Wählen Sie aus, was Sie an der neuen Rechnung ändern möchten:
          </p>
        </div>

        <div className="space-y-4 mb-6">
          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={options.changeCustomer}
              onChange={() => handleOptionChange('changeCustomer')}
            />
            <span className="font-medium">Kunde ändern</span>
          </label>

          {options.changeCustomer && (
            <div className="ml-6 mt-2">
              <select
                value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
              >
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={options.changeDate}
              onChange={() => handleOptionChange('changeDate')}
            />
            <span className="font-medium">Datum ändern</span>
          </label>

          {options.changeDate && (
            <div className="ml-6 mt-2">
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
              />
            </div>
          )}

          <label className="flex items-center gap-3 p-3 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50">
            <input
              type="checkbox"
              checked={options.changeItems}
              onChange={() => handleOptionChange('changeItems')}
            />
            <span className="font-medium">Posten bearbeiten</span>
          </label>

          {options.changeItems && (
            <div className="ml-6 mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Nach dem Duplizieren wird das Bearbeitungsformular geöffnet.
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
          >
            Abbrechen
          </button>
          <button
            onClick={handleDuplicate}
            className="flex-1 px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Duplizieren
          </button>
        </div>
      </div>
    </div>
  )
}