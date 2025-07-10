'use client'

import { useData } from '@/contexts/DataContext'
import { useModal } from '@/contexts/ModalContext'
import { useNotification } from '@/contexts/NotificationContext'
import { ViewType } from '@/types'
import { formatCurrency, formatDate } from '@/utils/helpers'

interface RecentInvoicesProps {
  setCurrentView: (view: ViewType) => void
}

export default function RecentInvoices({ setCurrentView }: RecentInvoicesProps) {
  const { invoices, setCurrentInvoice, updateInvoice } = useData()
  const { openModal } = useModal()
  const { showSuccess, showWarning } = useNotification()

  const isOverdue = (dueDate: string) => {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString()
  }

  const handleTogglePaid = (invoiceId: number, e: React.MouseEvent) => {
    e.stopPropagation() // Prevent triggering the invoice preview
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

  // Get latest 3 invoices for PC (was 5)
  const recentInvoices = invoices
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 3)

  if (recentInvoices.length === 0) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Noch keine Rechnungen</h3>
        <p className="text-[var(--muted)] mb-4">Erstelle deine erste Rechnung und werde schneller bezahlt.</p>
        <button 
          onClick={() => openModal('invoice')}
          className="px-4 py-2 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold"
        >
          Erste Rechnung erstellen
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3 overflow-y-auto h-full">
      {/* PC: Show 2 invoices initially, 3rd on scroll */}
      <div className="hidden md:block">
        <div className="space-y-3 h-[240px] overflow-y-auto">
          {recentInvoices.map((invoice) => (
            <div
              key={invoice.id}
              className="border border-gray-200 rounded-lg p-3 lg:p-4 hover:shadow-md transition-shadow cursor-pointer flex-shrink-0"
              onClick={() => {
                setCurrentInvoice(invoice)
                setCurrentView('invoice-preview')
              }}
            >
              <div className="flex justify-between items-start mb-2">
                <div className="min-w-0 flex-1">
                  <h4 className="font-semibold text-sm lg:text-base truncate">{invoice.number}</h4>
                  <p className="text-xs lg:text-sm text-[var(--muted)] truncate">{invoice.customerName}</p>
                </div>
                <div className="text-right ml-2 flex-shrink-0">
                  <p className="font-bold text-sm lg:text-base mb-2">{formatCurrency(invoice.amount)}</p>
                  <span 
                    className={`inline-block px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                      invoice.paid 
                        ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                        : !invoice.paid && isOverdue(invoice.dueDate)
                        ? 'bg-red-100 text-red-800 hover:bg-red-200'
                        : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                    }`}
                    onClick={(e) => handleTogglePaid(invoice.id, e)}
                  >
                    {invoice.paid ? 'Bezahlt' : isOverdue(invoice.dueDate) ? 'Überfällig' : 'Ausstehend'}
                  </span>
                </div>
              </div>
              <p className="text-xs lg:text-sm text-[var(--muted)]">{formatDate(invoice.date)}</p>
            </div>
          ))}
        </div>
      </div>
      
      {/* Mobile: Show all with normal scrolling */}
      <div className="md:hidden space-y-3">
        {recentInvoices.map((invoice) => (
          <div
            key={invoice.id}
            className="border border-gray-200 rounded-lg p-3 lg:p-4 hover:shadow-md transition-shadow cursor-pointer flex-shrink-0"
            onClick={() => {
              setCurrentInvoice(invoice)
              setCurrentView('invoice-preview')
            }}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-sm lg:text-base truncate">{invoice.number}</h4>
                <p className="text-xs lg:text-sm text-[var(--muted)] truncate">{invoice.customerName}</p>
              </div>
              <div className="text-right ml-2 flex-shrink-0">
                <p className="font-bold text-sm lg:text-base mb-2">{formatCurrency(invoice.amount)}</p>
                <span 
                  className={`inline-block px-2 py-1 rounded text-xs font-medium cursor-pointer transition-colors ${
                    invoice.paid 
                      ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                      : !invoice.paid && isOverdue(invoice.dueDate)
                      ? 'bg-red-100 text-red-800 hover:bg-red-200'
                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                  }`}
                  onClick={(e) => handleTogglePaid(invoice.id, e)}
                >
                  {invoice.paid ? 'Bezahlt' : isOverdue(invoice.dueDate) ? 'Überfällig' : 'Ausstehend'}
                </span>
              </div>
            </div>
            <p className="text-xs lg:text-sm text-[var(--muted)]">{formatDate(invoice.date)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}