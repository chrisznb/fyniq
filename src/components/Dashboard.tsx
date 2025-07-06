'use client'

import { useData } from '@/contexts/DataContext'
import { useModal } from '@/contexts/ModalContext'
import { ViewType } from '@/types'
import { formatCurrency, getFirstName } from '@/utils/helpers'
import YearlyChart from './YearlyChart'
import RecentInvoices from './RecentInvoices'

interface DashboardProps {
  setCurrentView: (view: ViewType) => void
}

export default function Dashboard({ setCurrentView }: DashboardProps) {
  const { invoices, profile } = useData()
  const { openModal } = useModal()

  // Calculate statistics
  const totalRevenue = invoices.filter(inv => inv.paid).reduce((sum, inv) => sum + inv.amount, 0)
  const pendingAmount = invoices.filter(inv => !inv.paid).reduce((sum, inv) => sum + inv.amount, 0)
  const invoiceCount = invoices.length
  const currentYear = new Date().getFullYear()
  const currentYearRevenue = invoices
    .filter(inv => new Date(inv.date).getFullYear() === currentYear && inv.paid)
    .reduce((sum, inv) => sum + inv.amount, 0)

  const firstName = getFirstName(profile.companyName)

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold">
            {firstName ? `Willkommen zurück, ${firstName}!` : 'Willkommen zurück!'}
          </h1>
          <button
            onClick={() => openModal('invoice')}
            className="px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            + Neue Rechnung
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8 flex-shrink-0">
          <div className="border-3 border-black rounded-lg p-4 lg:p-6 bg-[var(--accent)] text-center">
            <p className="text-2xl lg:text-3xl font-bold text-black">{formatCurrency(totalRevenue)}</p>
            <p className="text-sm text-[var(--muted)] mt-2">Gesamtumsatz</p>
          </div>
          <div className="border-3 border-black rounded-lg p-4 lg:p-6 bg-[var(--accent)] text-center">
            <p className="text-2xl lg:text-3xl font-bold text-black">{formatCurrency(pendingAmount)}</p>
            <p className="text-sm text-[var(--muted)] mt-2">Ausstehend</p>
          </div>
          <div className="border-3 border-black rounded-lg p-4 lg:p-6 bg-[var(--accent)] text-center">
            <p className="text-2xl lg:text-3xl font-bold text-black">{invoiceCount}</p>
            <p className="text-sm text-[var(--muted)] mt-2">Rechnungen</p>
          </div>
          <div className="border-3 border-black rounded-lg p-4 lg:p-6 bg-[var(--accent)] text-center">
            <p className="text-2xl lg:text-3xl font-bold text-black">{formatCurrency(currentYearRevenue)}</p>
            <p className="text-sm text-[var(--muted)] mt-2">{currentYear}</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 flex-1 min-h-0">
          {/* Yearly Statistics */}
          <div className="border-3 border-black rounded-lg p-4 lg:p-6 bg-white flex flex-col min-h-0">
            <h2 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 flex-shrink-0">Jahresstatistik</h2>
            <div className="flex-1 min-h-0 relative">
              <div className="absolute inset-0">
                <YearlyChart />
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="border-3 border-black rounded-lg p-4 lg:p-6 bg-white flex flex-col min-h-0">
            <h2 className="text-lg lg:text-xl font-bold mb-3 lg:mb-4 flex-shrink-0">Letzte Rechnungen</h2>
            <div className="flex-1 min-h-0 overflow-hidden">
              <RecentInvoices setCurrentView={setCurrentView} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}