'use client'

import { useState } from 'react'
import { useData } from '@/contexts/DataContext'
import { useModal } from '@/contexts/ModalContext'
import { useNotification } from '@/contexts/NotificationContext'
import { ViewType, Invoice } from '@/types'
import { formatCurrency, formatDate } from '@/utils/helpers'
import ConfirmDialog from './notifications/ConfirmDialog'

interface InvoicesViewProps {
  setCurrentView: (view: ViewType) => void
}

export default function InvoicesView({ setCurrentView }: InvoicesViewProps) {
  const { invoices, updateInvoice, deleteInvoice, restoreInvoice, setCurrentInvoice, customers } = useData()
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

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

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

  const handleSendReminder = (invoice: Invoice) => {
    const customer = customers.find(c => c.id === invoice.customerId)
    const customerEmail = customer?.email || ''
    
    const subject = encodeURIComponent(`Zahlungserinnerung: Rechnung ${invoice.number}`)
    const body = encodeURIComponent(
      `Sehr geehrte Damen und Herren,\n\n` +
      `hiermit möchte ich Sie an die noch ausstehende Zahlung für Rechnung ${invoice.number} vom ${formatDate(invoice.date)} erinnern.\n\n` +
      `Rechnungsbetrag: ${formatCurrency(invoice.amount)}\n` +
      `Fällig seit: ${formatDate(invoice.dueDate)}\n\n` +
      `Bitte überweisen Sie den Betrag baldmöglichst.\n\n` +
      `Mit freundlichen Grüßen`
    )
    window.location.href = `mailto:${customerEmail}?subject=${subject}&body=${body}`
    
    showSuccess(
      `Erinnerung vorbereitet`,
      `E-Mail-Programm wird geöffnet für ${invoice.number}`
    )
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Alle Rechnungen</h1>
          <button 
            onClick={() => openModal('invoice')}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
          >
            + Neue Rechnung
          </button>
        </div>
        
        <div className="border-3 border-black rounded-lg p-6 sm:p-8 lg:p-12 bg-white text-center">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Noch keine Rechnungen</h3>
          <p className="text-sm sm:text-base text-[var(--muted)] mb-4 sm:mb-6">Erstelle deine erste Rechnung und werde schneller bezahlt.</p>
          <button 
            onClick={() => openModal('invoice')}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
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
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4 sm:mb-6 flex-shrink-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Alle Rechnungen</h1>
          <button 
            onClick={() => openModal('invoice')}
            className="px-4 py-2 sm:px-6 sm:py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
          >
            + Neue Rechnung
          </button>
        </div>

        {/* Search and Sort Bar */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6 flex-shrink-0">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Rechnungen durchsuchen..."
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
                      <button
                        onClick={() => handleTogglePaid(invoice.id)}
                        className={`px-3 py-1 rounded-full text-sm font-medium cursor-pointer transition-colors ${
                          invoice.paid 
                            ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                            : !invoice.paid && isOverdue(invoice.dueDate)
                            ? 'bg-red-100 text-red-800 hover:bg-red-200'
                            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                        }`}
                      >
                        {invoice.paid ? 'Bezahlt' : isOverdue(invoice.dueDate) ? 'Überfällig' : 'Ausstehend'}
                      </button>
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
                        {!invoice.paid && isOverdue(invoice.dueDate) && (
                          <button
                            onClick={() => handleSendReminder(invoice)}
                            className="px-2 py-1 bg-red-100 text-red-800 border border-black rounded text-xs font-medium hover:bg-red-200 transition-colors"
                          >
                            Erinnern
                          </button>
                        )}
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
          {filteredAndSortedInvoices.map((invoice) => (
            <div key={invoice.id} className="border-3 border-black rounded-lg p-3 sm:p-4 bg-white">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="font-bold text-base sm:text-lg">{invoice.number}</h3>
                  <p className="text-sm text-[var(--muted)]">{invoice.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-base sm:text-lg">{formatCurrency(invoice.amount)}</p>
                  <button
                    onClick={() => handleTogglePaid(invoice.id)}
                    className={`inline-block px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      invoice.paid 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : !invoice.paid && isOverdue(invoice.dueDate)
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                  >
                    {invoice.paid ? 'Bezahlt' : isOverdue(invoice.dueDate) ? 'Überfällig' : 'Ausstehend'}
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm">
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

              <div className="grid grid-cols-2 gap-2 mb-2 sm:mb-3">
                <button
                  onClick={() => handleViewInvoice(invoice.id)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--accent)] text-black border-3 border-black rounded-lg font-medium hover:bg-[var(--accent)]/80 transition-colors text-sm"
                >
                  Ansehen
                </button>
                <button
                  onClick={() => handleEditInvoice(invoice.id)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--accent)] text-black border-3 border-black rounded-lg font-medium hover:bg-[var(--accent)]/80 transition-colors text-sm"
                >
                  Bearbeiten
                </button>
                <button
                  onClick={() => handleDuplicateInvoice(invoice.id)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-[var(--accent)] text-black border-3 border-black rounded-lg font-medium hover:bg-[var(--accent)]/80 transition-colors text-sm"
                >
                  Duplizieren
                </button>
                <button
                  onClick={() => handleDeleteInvoice(invoice.id)}
                  className="px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 text-black border-3 border-black rounded-lg font-medium hover:bg-red-200 transition-colors flex items-center justify-center"
                >
                  <span className="text-2xl">⌫</span>
                </button>
              </div>
              {!invoice.paid && isOverdue(invoice.dueDate) && (
                <div className="mt-2">
                  <button
                    onClick={() => handleSendReminder(invoice)}
                    className="w-full px-3 py-1.5 sm:px-4 sm:py-2 bg-red-100 text-red-800 border-3 border-black rounded-lg font-medium hover:bg-red-200 transition-colors text-sm flex items-center justify-center gap-2"
                  >
                    Zahlungserinnerung senden
                  </button>
                </div>
              )}
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