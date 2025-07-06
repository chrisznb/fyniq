'use client'

import { useState, useEffect } from 'react'
import { useData } from '@/contexts/DataContext'
import { useNotification } from '@/contexts/NotificationContext'
import { useUserActivity } from '@/contexts/UserActivityContext'
import { generateInvoiceNumber, calculateDueDate } from '@/utils/helpers'
import { InvoiceItem } from '@/types'

interface InvoiceModalProps {
  onClose: () => void
  editInvoiceId?: number | null
}

export default function InvoiceModal({ onClose, editInvoiceId }: InvoiceModalProps) {
  const { customers, addInvoice, updateInvoice, invoices } = useData()
  const { showSuccess, showError } = useNotification()
  const { onInvoiceCreated } = useUserActivity()
  const [formData, setFormData] = useState({
    customerId: '',
    date: new Date().toISOString().split('T')[0],
    dueDate: calculateDueDate(new Date().toISOString().split('T')[0] as string),
    invoiceNumber: '',
  })
  const [items, setItems] = useState<InvoiceItem[]>([
    { name: '', amount: 0, quantity: 1 }
  ])

  const isEdit = editInvoiceId !== null && editInvoiceId !== undefined

  useEffect(() => {
    if (isEdit) {
      const invoice = invoices.find(inv => inv.id === editInvoiceId)
      if (invoice) {
        setFormData({
          customerId: invoice.customerId.toString(),
          date: invoice.date,
          dueDate: invoice.dueDate,
          invoiceNumber: invoice.number,
        })
        setItems(invoice.items || [{ name: '', amount: 0, quantity: 1 }])
      }
    }
  }, [isEdit, editInvoiceId, invoices])

  const addItem = () => {
    setItems([...items, { name: '', amount: 0, quantity: 1, description: undefined }])
  }

  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index)
    // Ensure at least one item exists
    if (newItems.length === 0) {
      setItems([{ name: '', amount: 0, quantity: 1, description: undefined }])
    } else {
      setItems(newItems)
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number | undefined) => {
    const updatedItems = [...items]
    updatedItems[index] = { ...updatedItems[index], [field]: value } as InvoiceItem
    setItems(updatedItems)
  }

  const toggleDescription = (index: number) => {
    const item = items[index]
    const hasDescription = item.description !== undefined
    updateItem(index, 'description', hasDescription ? undefined : '')
  }


  const totalAmount = items.reduce((sum, item) => sum + ((item.amount || 0) * (item.quantity || 1)), 0)
  
  // Generate auto-complete invoice number
  const getAutoInvoiceNumber = () => {
    if (!formData.customerId) return ''
    const customer = customers.find(c => c.id === parseInt(formData.customerId))
    if (!customer) return ''
    return generateInvoiceNumber(customer.customerNumber, invoices)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const customer = customers.find(c => c.id === parseInt(formData.customerId))
    if (!customer) {
      showError('Kunde erforderlich', 'Bitte wählen Sie einen Kunden aus.')
      return
    }

    const validItems = items.filter(item => item.name.trim() && item.amount > 0)
    if (validItems.length === 0) {
      showError('Posten erforderlich', 'Bitte fügen Sie mindestens einen gültigen Posten hinzu.')
      return
    }

    // Clean up items - remove undefined descriptions and convert to empty string
    const cleanedItems = validItems.map(item => ({
      ...item,
      description: item.description || ''
    }))

    if (isEdit && editInvoiceId) {
      const existingInvoice = invoices.find(inv => inv.id === editInvoiceId)
      if (existingInvoice) {
        const updatedInvoice = {
          ...existingInvoice,
          date: formData.date,
          dueDate: formData.dueDate,
          customerId: customer.id,
          customerName: customer.name,
          amount: totalAmount,
          description: cleanedItems.map(item => item.name).join(', '),
          items: cleanedItems,
        }
        updateInvoice(updatedInvoice)
        showSuccess('Rechnung aktualisiert', `Rechnung ${existingInvoice.number} wurde erfolgreich aktualisiert`)
      }
    } else {
      const finalInvoiceNumber = formData.invoiceNumber.trim() || generateInvoiceNumber(customer.customerNumber, invoices)
      
      const newInvoice = {
        id: Date.now(),
        number: finalInvoiceNumber,
        date: formData.date,
        dueDate: formData.dueDate,
        customerId: customer.id,
        customerName: customer.name,
        amount: totalAmount,
        description: cleanedItems.map(item => item.name).join(', '),
        paid: false,
        items: cleanedItems,
      }
      addInvoice(newInvoice)
      onInvoiceCreated() // Trigger feedback timing logic
      showSuccess('Rechnung erstellt', `Rechnung ${newInvoice.number} wurde erfolgreich erstellt`)
    }
    
    onClose()
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center p-4" style={{ zIndex: 1000, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
      <div className="bg-white border-3 border-black rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">{isEdit ? 'Rechnung bearbeiten' : 'Neue Rechnung erstellen'}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-3xl font-bold"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Kunde</label>
              <select
                value={formData.customerId}
                onChange={(e) => setFormData(prev => ({ ...prev, customerId: e.target.value }))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                required
              >
                <option value="">Kunde auswählen...</option>
                {customers.map(customer => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Rechnungsnummer</label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, invoiceNumber: e.target.value }))}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                />
                {!formData.invoiceNumber && (
                  <div className="absolute inset-0 p-3 text-gray-400 pointer-events-none">
                    {getAutoInvoiceNumber()}
                  </div>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Leer lassen für automatische Generierung: {getAutoInvoiceNumber()}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Rechnungsdatum</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => {
                  const newDate = e.target.value
                  setFormData(prev => ({ 
                    ...prev, 
                    date: newDate,
                    dueDate: newDate.length === 10 ? calculateDueDate(newDate) : prev.dueDate
                  }))
                }}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Fälligkeitsdatum</label>
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
                required
              />
            </div>
          </div>

          {/* Invoice Items */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Leistungen</h3>
              <button
                type="button"
                onClick={addItem}
                className="px-4 py-2 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
              >
                + Posten hinzufügen
              </button>
            </div>

            <div className="space-y-6">
              {items.map((item, index) => (
                <div key={index} className="border-3 border-black rounded-lg p-5 bg-white">
                  {/* Item Header */}
                  <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                      <input
                        type="text"
                        placeholder="Posten..."
                        value={item.name}
                        onChange={(e) => updateItem(index, 'name', e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none font-medium"
                        required
                      />
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="1"
                        value={item.quantity || ''}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-16 p-3 border border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none text-center"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="0,00"
                        value={item.amount || ''}
                        onChange={(e) => updateItem(index, 'amount', parseFloat(e.target.value) || 0)}
                        className="w-24 p-3 border border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none text-right"
                        required
                      />
                      <span className="w-24 p-3 border border-gray-300 rounded-lg bg-gray-50 text-right">
                        {((item.amount || 0) * (item.quantity || 1)).toFixed(2)}€
                      </span>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="px-3 py-2 bg-red-500 text-white border-3 border-black rounded-lg font-bold hover:shadow-lg transition-all"
                        title="Posten entfernen"
                      >
                        ✕
                      </button>
                    </div>
                  </div>

                  {/* Item Controls */}
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => toggleDescription(index)}
                      className={`px-3 py-1.5 border border-gray-300 rounded-md text-sm font-medium transition-all ${
                        item.description !== undefined
                          ? 'bg-[var(--accent)] border-black' 
                          : 'bg-white hover:bg-gray-50'
                      }`}
                    >
                      {item.description !== undefined ? '- Beschreibung' : '+ Beschreibung'}
                    </button>
                  </div>

                  {/* Description Editor */}
                  {item.description !== undefined && (
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <textarea
                        placeholder="Detaillierte Beschreibung..."
                        value={item.description || ''}
                        onChange={(e) => updateItem(index, 'description', e.target.value)}
                        className="w-full min-h-[80px] p-3 border border-gray-300 rounded-lg bg-white focus:border-[var(--accent)] outline-none resize-y"
                        style={{ direction: 'ltr', textAlign: 'left' }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="border-t-2 border-gray-200 pt-4">
            <div className="text-right">
              <p className="text-xl font-bold">Gesamtbetrag: {totalAmount.toFixed(2)}€</p>
            </div>
          </div>

          {/* Submit Buttons */}
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
{isEdit ? 'Rechnung aktualisieren' : 'Rechnung erstellen'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}