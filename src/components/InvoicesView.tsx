'use client'

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { useModal } from '@/contexts/ModalContext'
import { useNotification } from '@/contexts/NotificationContext'
import { ViewType } from '@/types'
import { formatCurrency, formatDate } from '@/utils/helpers'
import ConfirmDialog from './notifications/ConfirmDialog'

interface InvoicesViewProps {
  setCurrentView: (view: ViewType) => void
}

export default function InvoicesView({ setCurrentView }: InvoicesViewProps) {
  const { invoices, updateInvoice, deleteInvoice, restoreInvoice, setCurrentInvoice } = useData()
  const { openModal } = useModal()
  const { showSuccess, showWarning, showDelete } = useNotification()
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; invoiceId: number | null; invoiceNumber: string }>({
    isOpen: false,
    invoiceId: null,
    invoiceNumber: ''
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'number' | 'customer' | 'amount' | 'status'>('date')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const handleTogglePaid = (invoiceId: number) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      updateInvoice({ ...invoice, paid: !invoice.paid })
      if (invoice.paid) {
        // Was paid, now marking as pending (ausstehend) - show warning (yellow)
        showWarning(
          `Rechnung ${invoice.number}`,
          'Als ausstehend markiert'
        )
      } else {
        // Was pending, now marking as paid - show success (green)
        showSuccess(
          `Rechnung ${invoice.number}`,
          'Als bezahlt markiert'
        )
      }
    }
  }

  const handleDeleteInvoice = (invoiceId: number) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      setDeleteConfirm({
        isOpen: true,
        invoiceId,
        invoiceNumber: invoice.number
      })
    }
  }

  const confirmDelete = () => {
    if (deleteConfirm.invoiceId) {
      const invoice = invoices.find(inv => inv.id === deleteConfirm.invoiceId)
      if (invoice) {
        deleteInvoice(deleteConfirm.invoiceId)
        showDelete(
          'Rechnung gelöscht', 
          `Rechnung ${deleteConfirm.invoiceNumber} wurde erfolgreich gelöscht`,
          () => restoreInvoice(invoice),
          'Wiederherstellen'
        )
      }
    }
    setDeleteConfirm({ isOpen: false, invoiceId: null, invoiceNumber: '' })
  }

  const cancelDelete = () => {
    setDeleteConfirm({ isOpen: false, invoiceId: null, invoiceNumber: '' })
  }

  const handleViewInvoice = (invoiceId: number) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      setCurrentInvoice(invoice)
      setCurrentView('invoice-preview')
    }
  }

  const handleEditInvoice = (invoiceId: number) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      openModal('invoice', { editInvoiceId: invoiceId })
    }
  }

  const handleDuplicateInvoice = (invoiceId: number) => {
    const invoice = invoices.find(inv => inv.id === invoiceId)
    if (invoice) {
      openModal('duplicate-invoice', { sourceInvoice: invoice })
    }
  }

  // Filter and sort invoices
  const filteredAndSortedInvoices = invoices
    .filter(invoice => {
      if (!searchTerm) return true
      const term = searchTerm.toLowerCase()
      return (
        invoice.number.toLowerCase().includes(term) ||
        invoice.customerName.toLowerCase().includes(term) ||
        invoice.description.toLowerCase().includes(term) ||
        invoice.amount.toString().includes(term)
      )
    })
    .sort((a, b) => {
      let comparison = 0
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
          break
        case 'number':
          comparison = a.number.localeCompare(b.number)
          break
        case 'customer':
          comparison = a.customerName.localeCompare(b.customerName)
          break
        case 'amount':
          comparison = a.amount - b.amount
          break
        case 'status':
          comparison = (a.paid === b.paid) ? 0 : (a.paid ? 1 : -1)
          break
        default:
          return 0
      }
      
      return sortOrder === 'asc' ? comparison : -comparison
    })


  if (invoices.length === 0) {
    return (
      <>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Alle Rechnungen</h1>
          <button 
            onClick={() => openModal('invoice')}
            className="px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            + Neue Rechnung
          </button>
        </div>
        
        <div className="border-3 border-black rounded-lg p-12 bg-white text-center">
          <h3 className="text-xl font-semibold mb-4">Noch keine Rechnungen</h3>
          <p className="text-[var(--muted)] mb-6">Erstelle deine erste Rechnung und werde schneller bezahlt.</p>
          <button 
            onClick={() => openModal('invoice')}
            className="px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            Erste Rechnung erstellen
          </button>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold">Alle Rechnungen</h1>
          <button 
            onClick={() => openModal('invoice')}
            className="px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            + Neue Rechnung
          </button>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex gap-4 mb-6 flex-shrink-0">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechnungen durchsuchen..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none"
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
              className="p-3 border-2 border-gray-300 rounded-lg focus:border-[var(--accent)] outline-none bg-white"
            >
              <option value="date-desc">Datum (Neueste zuerst)</option>
              <option value="date-asc">Datum (Älteste zuerst)</option>
              <option value="number-asc">Rechnungsnummer (A-Z)</option>
              <option value="number-desc">Rechnungsnummer (Z-A)</option>
              <option value="customer-asc">Kunde (A-Z)</option>
              <option value="customer-desc">Kunde (Z-A)</option>
              <option value="amount-desc">Betrag (Hoch-Niedrig)</option>
              <option value="amount-asc">Betrag (Niedrig-Hoch)</option>
              <option value="status-desc">Status (Bezahlt zuerst)</option>
              <option value="status-asc">Status (Ausstehend zuerst)</option>
            </select>
          </div>
        </div>

        {/* Desktop Table View */}
        <div className="hidden lg:block flex-1 overflow-auto">
          <div className="border-3 border-black rounded-lg bg-white overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-black">
                <tr>
                  <th className="text-left p-4 font-semibold">Rechnungsnummer</th>
                  <th className="text-left p-4 font-semibold">Kunde</th>
                  <th className="text-left p-4 font-semibold">Datum</th>
                  <th className="text-left p-4 font-semibold">Fällig</th>
                  <th className="text-right p-4 font-semibold">Betrag</th>
                  <th className="text-center p-4 font-semibold">Status</th>
                  <th className="text-center p-4 font-semibold">Aktionen</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedInvoices.map((invoice, index) => (
                  <tr key={invoice.id} className={`border-b border-gray-200 hover:bg-gray-50 ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                    <td className="p-4 font-medium">{invoice.number}</td>
                    <td className="p-4">{invoice.customerName}</td>
                    <td className="p-4">{formatDate(invoice.date)}</td>
                    <td className="p-4">{formatDate(invoice.dueDate)}</td>
                    <td className="p-4 text-right font-semibold">{formatCurrency(invoice.amount)}</td>
                    <td className="p-4 text-center">
                      <label className="flex items-center justify-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={invoice.paid}
                          onChange={() => handleTogglePaid(invoice.id)}
                        />
                        <span className="text-sm">{invoice.paid ? 'Bezahlt' : 'Ausstehend'}</span>
                      </label>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1 justify-center flex-wrap">
                        <button
                          onClick={() => handleViewInvoice(invoice.id)}
                          className="px-2 py-1 bg-[var(--accent)] text-black border border-black rounded text-xs font-medium hover:bg-[var(--accent)]/80 transition-colors"
                        >
                          Ansehen
                        </button>
                        <button
                          onClick={() => handleEditInvoice(invoice.id)}
                          className="px-2 py-1 bg-[var(--accent)] text-black border border-black rounded text-xs font-medium hover:bg-[var(--accent)]/80 transition-colors"
                        >
                          Bearbeiten
                        </button>
                        <button
                          onClick={() => handleDuplicateInvoice(invoice.id)}
                          className="px-2 py-1 bg-[var(--accent)] text-black border border-black rounded text-xs font-medium hover:bg-[var(--accent)]/80 transition-colors"
                        >
                          Duplizieren
                        </button>
                        <button
                          onClick={() => handleDeleteInvoice(invoice.id)}
                          className="px-2 py-1 bg-red-100 text-black border border-black rounded text-xs font-medium hover:bg-red-200 transition-colors"
                        >
                          ⌫
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
        <div className="lg:hidden flex-1 overflow-auto space-y-4">
          {filteredAndSortedInvoices.map((invoice) => (
            <div key={invoice.id} className="border-3 border-black rounded-lg p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-lg">{invoice.number}</h3>
                  <p className="text-[var(--muted)]">{invoice.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg">{formatCurrency(invoice.amount)}</p>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                    invoice.paid 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {invoice.paid ? 'Bezahlt' : 'Ausstehend'}
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                <div>
                  <span className="text-[var(--muted)]">Datum:</span>
                  <br />
                  {formatDate(invoice.date)}
                </div>
                <div>
                  <span className="text-[var(--muted)]">Fällig:</span>
                  <br />
                  {formatDate(invoice.dueDate)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-3">
                <button
                  onClick={() => handleViewInvoice(invoice.id)}
                  className="px-4 py-2 bg-[var(--accent)] text-black border-3 border-black rounded-lg font-medium hover:bg-[var(--accent)]/80 transition-colors"
                >
                  Ansehen
                </button>
                <button
                  onClick={() => handleEditInvoice(invoice.id)}
                  className="px-4 py-2 bg-[var(--accent)] text-black border-3 border-black rounded-lg font-medium hover:bg-[var(--accent)]/80 transition-colors"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDuplicateInvoice(invoice.id)}
                  className="px-4 py-2 bg-[var(--accent)] text-black border-3 border-black rounded-lg font-medium hover:bg-[var(--accent)]/80 transition-colors"
                >
                  Duplizieren
                </button>
                <button
                  onClick={() => handleDeleteInvoice(invoice.id)}
                  className="px-4 py-2 bg-red-100 text-black border-3 border-black rounded-lg font-medium hover:bg-red-200 transition-colors"
                >
                  ⌫
                </button>
              </div>
              <div className="flex gap-2">
                <label className="flex items-center gap-2 px-4 py-2 border-2 border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 flex-1">
                  <input
                    type="checkbox"
                    checked={invoice.paid}
                    onChange={() => handleTogglePaid(invoice.id)}
                  />
                  <span className="text-sm">Bezahlt</span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Rechnung löschen?"
        message={`Möchten Sie die Rechnung "${deleteConfirm.invoiceNumber}" wirklich löschen?`}
        confirmText="Löschen"
        cancelText="Abbrechen"
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        type="danger"
      />
    </>
  )
}