import { Customer, Invoice } from '@/types'

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount)
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('de-DE')
}

export function getFirstName(fullName: string): string {
  if (!fullName) return ''
  return fullName.split(' ')[0]
}

export function generateCustomerNumber(existingCustomers: Customer[] = []): string {
  // Get the highest existing customer number
  const existingNumbers = existingCustomers
    .map(customer => parseInt(customer.customerNumber) || 0)
    .filter(num => !isNaN(num))
  
  const highestNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) : 0
  const nextNumber = highestNumber + 1
  
  return nextNumber.toString().padStart(3, '0') // e.g., "001", "002"
}

export function generateInvoiceNumber(customerNumber: string, existingInvoices: Invoice[] = []): string {
  // Get the highest invoice number for this customer
  const customerInvoices = existingInvoices.filter(invoice => 
    invoice.number && invoice.number.includes(`RE-${customerNumber}-`)
  )
  
  const invoiceNumbers = customerInvoices
    .map(invoice => {
      const parts = invoice.number.split('-')
      return parts.length === 3 ? parseInt(parts[2]) || 0 : 0
    })
    .filter(num => !isNaN(num))
  
  const highestInvoiceNumber = invoiceNumbers.length > 0 ? Math.max(...invoiceNumbers) : 0
  const nextInvoiceNumber = highestInvoiceNumber + 1
  
  return `RE-${customerNumber}-${nextInvoiceNumber.toString().padStart(3, '0')}`
}

export function calculateDueDate(invoiceDate: string, daysToAdd: number = 14): string {
  // Check if the date is valid
  if (!invoiceDate || invoiceDate.length < 10) {
    // Return current date + days if invalid input
    const fallbackDate = new Date()
    fallbackDate.setDate(fallbackDate.getDate() + daysToAdd)
    return fallbackDate.toISOString().split('T')[0]
  }
  
  const date = new Date(invoiceDate)
  
  // Check if the date is valid
  if (isNaN(date.getTime())) {
    // Return current date + days if invalid date
    const fallbackDate = new Date()
    fallbackDate.setDate(fallbackDate.getDate() + daysToAdd)
    return fallbackDate.toISOString().split('T')[0]
  }
  
  date.setDate(date.getDate() + daysToAdd)
  return date.toISOString().split('T')[0]
}