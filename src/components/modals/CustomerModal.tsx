'use client'

import { useState, useEffect } from 'react'
import { useData } from '@/contexts/DataContext'
import { useNotification } from '@/contexts/NotificationContext'
import { Customer } from '@/types'
import { generateCustomerNumber } from '@/utils/helpers'

interface CustomerModalProps {
  onClose: () => void
  editCustomerId?: number | null
}

export default function CustomerModal({ onClose, editCustomerId }: CustomerModalProps) {
  const { customers, addCustomer, updateCustomer } = useData()
  const { showSuccess } = useNotification()
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    street: '',
    zip: '',
    city: '',
    taxId: '',
    customerNumber: '',
  })

  const isEdit = editCustomerId !== null && editCustomerId !== undefined

  useEffect(() => {
    if (isEdit) {
      const customer = customers.find(c => c.id === editCustomerId)
      if (customer) {
        const addressParts = customer.address.split('\n')
        setFormData({
          name: customer.name,
          company: customer.company || '',
          email: customer.email,
          street: addressParts[0] || '',
          zip: addressParts[1]?.split(' ')[0] || '',
          city: addressParts[1]?.split(' ').slice(1).join(' ') || '',
          taxId: customer.taxId || '',
          customerNumber: customer.customerNumber,
        })
      }
    }
  }, [isEdit, editCustomerId, customers])

  // Generate auto-complete customer number
  const getAutoCustomerNumber = () => {
    return generateCustomerNumber(customers)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const address = `${formData.street}\n${formData.zip} ${formData.city}`
    
    const customerData: Omit<Customer, 'id'> = {
      customerNumber: formData.customerNumber,
      name: formData.name,
      company: formData.company || undefined,
      email: formData.email,
      address: address,
      taxId: formData.taxId || undefined,
    }

    if (isEdit && editCustomerId) {
      const existingCustomer = customers.find(c => c.id === editCustomerId)
      if (existingCustomer) {
        const finalCustomerNumber = formData.customerNumber.trim() || existingCustomer.customerNumber
        updateCustomer({ ...customerData, id: editCustomerId, customerNumber: finalCustomerNumber })
        showSuccess('Kunde aktualisiert', `${customerData.name} wurde erfolgreich aktualisiert`)
      }
    } else {
      const finalCustomerNumber = formData.customerNumber.trim() || generateCustomerNumber(customers)
      addCustomer({ ...customerData, id: Date.now(), customerNumber: finalCustomerNumber })
      showSuccess('Kunde erstellt', `${customerData.name} wurde erfolgreich erstellt`)
    }
    
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 1000, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white border-3 border-black rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {isEdit ? 'Kunde bearbeiten' : 'Neuer Kunde'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Name/Ansprechpartner *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="Max Mustermann"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Kundennummer</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.customerNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerNumber: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                />
                {!formData.customerNumber && (
                  <div className="absolute inset-0 p-3 text-gray-400 pointer-events-none">
                    {getAutoCustomerNumber()}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leer lassen für automatische Generierung: {getAutoCustomerNumber()}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Unternehmen</label>
            <input
              type="text"
              value={formData.company}
              onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
              placeholder="Mustermann GmbH"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-Mail *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
              placeholder="max@mustermann.de"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Straße und Hausnummer *</label>
            <input
              type="text"
              value={formData.street}
              onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
              placeholder="Musterstraße 1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">PLZ *</label>
              <input
                type="text"
                value={formData.zip}
                onChange={(e) => setFormData(prev => ({ ...prev, zip: e.target.value }))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="12345"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Stadt *</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                placeholder="Musterstadt"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">USt-ID</label>
            <input
              type="text"
              value={formData.taxId}
              onChange={(e) => setFormData(prev => ({ ...prev, taxId: e.target.value }))}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
              placeholder="DE123456789"
            />
          </div>

          <div className="flex gap-4 pt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 font-semibold"
            >
              Abbrechen
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              {isEdit ? 'Aktualisieren' : 'Erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}