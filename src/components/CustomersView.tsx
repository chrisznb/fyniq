'use client'

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { useModal } from '@/contexts/ModalContext'
import { useNotification } from '@/contexts/NotificationContext'
import ConfirmDialog from './notifications/ConfirmDialog'

export default function CustomersView() {
  const { customers, deleteCustomer, restoreCustomer } = useData()
  const { openModal } = useModal()
  const { showDelete } = useNotification()
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; customerId: number | null; customerName: string }>({
    isOpen: false,
    customerId: null,
    customerName: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'name' | 'company' | 'email' | 'number'>('name')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc')

  const handleDeleteCustomer = (customerId: number) => {
    const customer = customers.find(c => c.id === customerId)
    if (customer) {
      setDeleteConfirm({
        isOpen: true,
        customerId,
        customerName: customer.name
      })
    }
  }

  const confirmDelete = () => {
    if (deleteConfirm.customerId) {
      const customer = customers.find(c => c.id === deleteConfirm.customerId)
      if (customer) {
        deleteCustomer(deleteConfirm.customerId)
        showDelete(
          'Kunde gelöscht', 
          `${deleteConfirm.customerName} wurde erfolgreich gelöscht`,
          () => restoreCustomer(customer),
          'Wiederherstellen'
        )
      }
    }
    setDeleteConfirm({ isOpen: false, customerId: null, customerName: '' })
  }

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, customerId: null, customerName: '' })
  }

  const handleEditCustomer = (customerId: number) => {
    openModal('customer', { editCustomerId: customerId })
  }

  // Filter and sort customers
  const filteredAndSortedCustomers = customers
    .filter(customer => {
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return (
        customer.name.toLowerCase().includes(term) ||
        customer.email.toLowerCase().includes(term) ||
        (customer.company && customer.company.toLowerCase().includes(term)) ||
        customer.customerNumber.toLowerCase().includes(term) ||
        customer.address.toLowerCase().includes(term)
      )
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name)
          break
        case 'company':
          comparison = (a.company || '').localeCompare(b.company || '')
          break
        case 'email':
          comparison = a.email.localeCompare(b.email)
          break
        case 'number':
          comparison = a.customerNumber.localeCompare(b.customerNumber)
          break
        default:
          return 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })

  if (customers.length === 0) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Kunden</h1>
          <button 
            onClick={() => openModal('customer')}
            className="px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            + Neuer Kunde
          </button>
        </div>
        
        <div className="border-3 border-black rounded-lg p-12 bg-white text-center">
          <h3 className="text-xl font-semibold mb-4">Noch keine Kunden</h3>
          <p className="text-[var(--muted)] mb-6">Füge deinen ersten Kunden hinzu.</p>
          <button 
            onClick={() => openModal('customer')}
            className="px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Kunde hinzufügen
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6 flex-shrink-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Kunden</h1>
          <button 
            onClick={() => openModal('customer')}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
          >
            + Neuer Kunde
          </button>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Kunden durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2.5 sm:p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none text-sm sm:text-base"
            />
          </div>
          <div className="relative">
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-') as [typeof sortBy, typeof sortOrder]
                setSortBy(field)
                setSortOrder(order)
              }}
              className="p-2.5 sm:p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none bg-white text-sm sm:text-base w-full sm:w-auto"
            >
              <option value="name-asc">Name (A-Z)</option>
              <option value="name-desc">Name (Z-A)</option>
              <option value="company-asc">Unternehmen (A-Z)</option>
              <option value="company-desc">Unternehmen (Z-A)</option>
              <option value="email-asc">E-Mail (A-Z)</option>
              <option value="email-desc">E-Mail (Z-A)</option>
              <option value="number-asc">Kundennummer (A-Z)</option>
              <option value="number-desc">Kundennummer (Z-A)</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block flex-1 overflow-auto">
          <div className="border-3 border-black rounded-lg bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-black">
                <tr>
                  <th className="text-left p-4 font-semibold">Nr.</th>
                  <th className="text-left p-4 font-semibold">Name</th>
                  <th className="text-left p-4 font-semibold">Unternehmen</th>
                  <th className="text-left p-4 font-semibold">E-Mail</th>
                  <th className="text-left p-4 font-semibold">Adresse</th>
                  <th className="text-center p-4 font-semibold">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedCustomers.map((customer, index) => (
                  <tr key={customer.id} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4 font-bold">{customer.customerNumber}</td>
                    <td className="p-4 font-medium">{customer.name}</td>
                    <td className="p-4">{customer.company || '-'}</td>
                    <td className="p-4">{customer.email}</td>
                    <td className="p-4 max-w-xs">
                      <div className="text-sm whitespace-pre-line">{customer.address}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2 justify-center">
                        <button
                          onClick={() => handleEditCustomer(customer.id)}
                          className="px-3 py-1 bg-[var(--accent)] text-black border border-black rounded text-sm font-medium hover:bg-[var(--accent)]/80 transition-colors"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDeleteCustomer(customer.id)}
                          className="px-3 py-1 bg-[var(--accent)] text-black border border-black rounded text-sm font-medium hover:bg-[var(--accent)]/80 transition-colors"
                        >
                          Löschen
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Card View */}
        <div className="lg:hidden flex-1 overflow-auto space-y-3 pb-4">
          {filteredAndSortedCustomers.map((customer) => (
            <div key={customer.id} className="border-3 border-black rounded-lg p-3 sm:p-4 bg-white">
              <div className="mb-3 sm:mb-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold text-base sm:text-lg">{customer.name}</h3>
                  <span className="px-1.5 sm:px-2 py-0.5 sm:py-1 bg-[var(--accent)] text-black font-bold text-xs sm:text-sm rounded border-3 border-black">
                    #{customer.customerNumber}
                  </span>
                </div>
                {customer.company && (
                  <p className="text-sm sm:text-base text-[var(--muted)] font-medium">{customer.company}</p>
                )}
                <p className="text-sm sm:text-base text-[var(--muted)]">{customer.email}</p>
              </div>
              
              <div className="mb-3 sm:mb-4">
                <span className="text-xs sm:text-sm text-[var(--muted)] font-medium">Adresse:</span>
                <div className="mt-1 text-xs sm:text-sm whitespace-pre-line">{customer.address}</div>
              </div>

              {customer.taxId && (
                <div className="mb-3 sm:mb-4">
                  <span className="text-xs sm:text-sm text-[var(--muted)] font-medium">USt-ID:</span>
                  <div className="mt-1 text-xs sm:text-sm">{customer.taxId}</div>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => handleEditCustomer(customer.id)}
                  className="flex-1 px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--accent)] text-black border-3 border-black rounded-lg font-medium hover:bg-[var(--accent)]/80 transition-colors text-sm"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDeleteCustomer(customer.id)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--accent)] text-black border-3 border-black rounded-lg font-medium hover:bg-[var(--accent)]/80 transition-colors text-sm"
                >
                  Löschen
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Kunde löschen?"
        message={`Möchten Sie den Kunden "${deleteConfirm.customerName}" wirklich löschen?`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />
    </>
  )
}