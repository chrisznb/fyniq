'use client'

import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { Bar } from 'react-chartjs-2'
import { useData } from '@/contexts/DataContext'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default function YearlyChart() {
  const { invoices } = useData()

  // Group invoices by month and payment status
  const monthlyPaidData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthInvoices = invoices.filter(inv => {
      const invoiceDate = new Date(inv.date)
      return invoiceDate.getMonth() + 1 === month && 
             invoiceDate.getFullYear() === new Date().getFullYear() &&
             inv.paid === true
    })
    return monthInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  })

  const monthlyPendingData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1
    const monthInvoices = invoices.filter(inv => {
      const invoiceDate = new Date(inv.date)
      return invoiceDate.getMonth() + 1 === month && 
             invoiceDate.getFullYear() === new Date().getFullYear() &&
             inv.paid === false
    })
    return monthInvoices.reduce((sum, inv) => sum + inv.amount, 0)
  })

  const data = {
    labels: ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
    datasets: [
      {
        label: 'Bezahlt',
        data: monthlyPaidData,
        backgroundColor: '#F5EEA8', // Yellow for paid
        borderColor: '#000',
        borderWidth: 3,
      },
      {
        label: 'Ausstehend',
        data: monthlyPendingData,
        backgroundColor: 'rgba(245, 238, 168, 0.4)', // Transparent yellow for pending
        borderColor: '#000',
        borderWidth: 3,
      },
    ],
  }

  const options = {
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
            return `${context[0].label} 2025`
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
  }

  return (
    <div className="w-full h-full">
      <Bar data={data} options={options} />
    </div>
  )
}