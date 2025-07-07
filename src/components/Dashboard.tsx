'use client'

import React, { memo, useMemo, useCallback } from 'react'
import { useData } from '@/contexts/DataContext'
import { useModal } from '@/contexts/ModalContext'
import { ViewType, Invoice } from '@/types'
import { formatCurrency, getFirstName } from '@/utils/helpers'
import YearlyChart from './YearlyChart'
import RecentInvoices from './RecentInvoices'
import { 
  Euro, 
  Clock, 
  FileText, 
  TrendingUp,
  Plus
} from 'lucide-react'

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
        <div className="flex items-center justify-between mb-4 sm:mb-6 flex-shrink-0">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">
            {firstName ? `Willkommen zurück, ${firstName}!` : 'Willkommen zurück!'}
          </h1>
          <button
            onClick={handleNewInvoice}
            className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--accent)] border-3 border-black rounded-full flex items-center justify-center font-semibold hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-black" />
          </button>
        </div>

        {/* Statistics Grid */}
        <div className="stats-container grid grid-cols-4 gap-1.5 sm:gap-3 lg:gap-6 mb-4 sm:mb-6 lg:mb-8 flex-shrink-0 stats-grid dashboard-grid">
          <div className="stats-card border-3 border-black rounded-lg p-2 sm:p-3 lg:p-6 bg-[var(--accent)] text-center min-w-0 flex flex-col items-center justify-center">
            <Euro className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mx-auto mb-1 sm:mb-2 text-black" />
            <p className="currency-text stats-text text-xs sm:text-base lg:text-xl font-bold text-black leading-tight">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-xs lg:text-sm text-[var(--muted)] mt-1 sm:mt-1 hidden sm:block">Gesamtumsatz</p>
          </div>
          <div className="stats-card border-3 border-black rounded-lg p-2 sm:p-3 lg:p-6 bg-[var(--accent)] text-center min-w-0 flex flex-col items-center justify-center">
            <Clock className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mx-auto mb-1 sm:mb-2 text-black" />
            <p className="currency-text stats-text text-xs sm:text-base lg:text-xl font-bold text-black leading-tight">{formatCurrency(stats.pendingAmount)}</p>
            <p className="text-xs lg:text-sm text-[var(--muted)] mt-1 sm:mt-1 hidden sm:block">Ausstehend</p>
          </div>
          <div className="stats-card border-3 border-black rounded-lg p-2 sm:p-3 lg:p-6 bg-[var(--accent)] text-center min-w-0 flex flex-col items-center justify-center">
            <FileText className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mx-auto mb-1 sm:mb-2 text-black" />
            <p className="stats-text text-xs sm:text-base lg:text-xl font-bold text-black leading-tight">{stats.invoiceCount}</p>
            <p className="text-xs lg:text-sm text-[var(--muted)] mt-1 sm:mt-1 hidden sm:block">Rechnungen</p>
          </div>
          <div className="stats-card border-3 border-black rounded-lg p-2 sm:p-3 lg:p-6 bg-[var(--accent)] text-center min-w-0 flex flex-col items-center justify-center">
            <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 mx-auto mb-1 sm:mb-2 text-black" />
            <p className="currency-text stats-text text-xs sm:text-base lg:text-xl font-bold text-black leading-tight">{formatCurrency(stats.currentYearRevenue)}</p>
            <p className="text-xs lg:text-sm text-[var(--muted)] mt-1 sm:mt-1 hidden sm:block">{stats.currentYear}</p>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 lg:gap-6 flex-1 min-h-0">
          {/* Yearly Statistics */}
          <div className="border-3 border-black rounded-lg p-3 sm:p-4 lg:p-6 bg-white flex flex-col min-h-[300px] sm:min-h-[350px] lg:min-h-0">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 lg:mb-4 flex-shrink-0">Jahresstatistik</h2>
            <div className="flex-1 min-h-0 relative">
              <div className="absolute inset-0">
                <YearlyChart />
              </div>
            </div>
          </div>

          {/* Recent Invoices */}
          <div className="border-3 border-black rounded-lg p-3 sm:p-4 lg:p-6 bg-white flex flex-col min-h-[300px] sm:min-h-[350px] lg:min-h-0">
            <h2 className="text-base sm:text-lg lg:text-xl font-bold mb-2 sm:mb-3 lg:mb-4 flex-shrink-0">Letzte Rechnungen</h2>
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