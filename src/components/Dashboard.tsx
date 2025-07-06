'use client'

import React, { memo, useMemo, useCallback } from 'react'
import { useData } from '@/contexts/DataContext'
import { useModal } from '@/contexts/ModalContext'
import { ViewType, Invoice } from '@/types'
import { formatCurrency, getFirstName } from '@/utils/helpers'
import YearlyChart from './YearlyChart'
import RecentInvoices from './RecentInvoices'

interface DashboardProps {
  setCurrentView: (view: ViewType) => void
}

/**
 * Performance-optimized statistics calculations
 */
const useDashboardStats = (invoices: Invoice[]) => {
  return useMemo(() => {
    const currentYear = new Date().getFullYear()
    let totalRevenue = 0
    let pendingAmount = 0
    let currentYearRevenue = 0
    
    // Single pass through invoices for all calculations
    invoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.date)
      const isCurrentYear = invoiceDate.getFullYear() === currentYear
      
      if (invoice.paid) {
        totalRevenue += invoice.amount
        if (isCurrentYear) {
          currentYearRevenue += invoice.amount
        }
      } else {
        pendingAmount += invoice.amount
      }
    })

    return {
      totalRevenue,
      pendingAmount,
      invoiceCount: invoices.length,
      currentYearRevenue,
      currentYear
    }
  }, [invoices])
}

function Dashboard({ setCurrentView }: DashboardProps) {
  const { invoices, profile } = useData()
  const { openModal } = useModal()
  
  // Memoized statistics calculation
  const stats = useDashboardStats(invoices)
  
  // Memoized user name calculation
  const firstName = useMemo(() => getFirstName(profile.companyName), [profile.companyName])
  
  // Memoized callback for new invoice button
  const handleNewInvoice = useCallback(() => {
    openModal('invoice')
  }, [openModal])

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center mb-6 flex-shrink-0">
          <h1 className="text-3xl font-bold">
            {firstName ? `Willkommen zurück, ${firstName}!` : 'Willkommen zurück!'}
          </h1>
          <button
            onClick={handleNewInvoice}
            className="px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
          >
            + Neue Rechnung
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-8 flex-shrink-0">
          <div className="border-3 border-black rounded-lg p-4 lg:p-6 bg-[var(--accent)] text-center">
            <p className="text-2xl lg:text-3xl font-bold text-black">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-sm text-[var(--muted)] mt-2">Gesamtumsatz</p>
          </div>
          <div className="border-3 border-black rounded-lg p-4 lg:p-6 bg-[var(--accent)] text-center">
            <p className="text-2xl lg:text-3xl font-bold text-black">{formatCurrency(stats.pendingAmount)}</p>
            <p className="text-sm text-[var(--muted)] mt-2">Ausstehend</p>
          </div>
          <div className="border-3 border-black rounded-lg p-4 lg:p-6 bg-[var(--accent)] text-center">
            <p className="text-2xl lg:text-3xl font-bold text-black">{stats.invoiceCount}</p>
            <p className="text-sm text-[var(--muted)] mt-2">Rechnungen</p>
          </div>
          <div className="border-3 border-black rounded-lg p-4 lg:p-6 bg-[var(--accent)] text-center">
            <p className="text-2xl lg:text-3xl font-bold text-black">{formatCurrency(stats.currentYearRevenue)}</p>
            <p className="text-sm text-[var(--muted)] mt-2">{stats.currentYear}</p>
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

// Export memoized component for performance optimization
export default memo(Dashboard)