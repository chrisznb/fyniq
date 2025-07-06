'use client'

import React, { memo, useMemo } from 'react'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useData } from '@/contexts/DataContext'
import { Invoice } from '@/types'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

/**
 * Performance-optimized chart calculation hooks
 */
const useMonthlyChartData = (invoices: Invoice[]) => {
  return useMemo(() => {
    const currentYear = new Date().getFullYear()
    
    // Pre-filter invoices for current year to reduce iterations
    const currentYearInvoices = invoices.filter(inv => {
      const invoiceDate = new Date(inv.date)
      return invoiceDate.getFullYear() === currentYear
    })

    // Initialize arrays for better performance
    const monthlyPaidData = new Array(12).fill(0)
    const monthlyPendingData = new Array(12).fill(0)
    
    // Single pass through filtered invoices
    currentYearInvoices.forEach(invoice => {
      const invoiceDate = new Date(invoice.date)
      const monthIndex = invoiceDate.getMonth() // 0-based month
      
      if (invoice.paid) {
        monthlyPaidData[monthIndex] += invoice.amount
      } else {
        monthlyPendingData[monthIndex] += invoice.amount
      }
    })

    return { monthlyPaidData, monthlyPendingData }
  }, [invoices])
}

function YearlyChart() {
  const { invoices } = useData()
  const { monthlyPaidData, monthlyPendingData } = useMonthlyChartData(invoices)

  // Memoize chart data to prevent unnecessary re-renders
  const chartData = useMemo(() => ({
    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Bezahlt',
        data: monthlyPaidData,
        backgroundColor: '#F5EEA8',
        borderColor: '#000',
        borderWidth: 3,
      },
      {
        label: 'Ausstehend',
        data: monthlyPendingData,
        backgroundColor: 'rgba(245, 238, 168, 0.4)',
        borderColor: '#000',
        borderWidth: 3,
      },
    ],
  }), [monthlyPaidData, monthlyPendingData])

  // Memoize chart options to prevent Chart.js re-initialization
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
      tooltip: {
        callbacks: {
          title: (context: Array<{ label: string }>) => {
            return `${context[0].label} ${new Date().getFullYear()}`
          },
          label: (context: { parsed: { y: number }, dataset: { label?: string } }) => {
            const value = context.parsed.y
            const label = context.dataset.label
            return `${label}: ${value.toFixed(2)}€`
          },
          afterBody: (context: Array<{ dataset: { label?: string }, parsed: { y: number } }>) => {
            const totalPaid = context.find((item) => item.dataset.label === 'Bezahlt')?.parsed.y || 0
            const totalPending = context.find((item) => item.dataset.label === 'Ausstehend')?.parsed.y || 0
            const total = totalPaid + totalPending
            return total > 0 ? `\nGesamt: ${total.toFixed(2)}€` : ''
          }
        },
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#F5EEA8',
        bodyColor: '#ffffff',
        borderColor: '#F5EEA8',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
        ticks: {
          callback: (value: string | number) => `${value}€`,
        },
      },
    },
  }), [])

  return (
    <div className="w-full h-full">
      <Bar data={chartData} options={chartOptions} />
    </div>
  )
}

// Export memoized component for performance optimization
export default memo(YearlyChart)