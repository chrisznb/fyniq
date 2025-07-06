'use client'

import React, { createContext, useContext, useState, useMemo } from 'react'
import { Invoice, Customer, Profile } from '@/types'
import { useSecureStorage } from '@/hooks/useSecureStorage'
import { validateAndSanitize, invoiceSchema, customerSchema } from '@/utils/validation'
import { ErrorBoundary } from '@/components/ErrorBoundary'

interface DataContextType {
  invoices: Invoice[]
  customers: Customer[]
  profile: Profile
  currentInvoice: Invoice | null
  isLoading: boolean
  setInvoices: (invoices: Invoice[]) => void
  setCustomers: (customers: Customer[]) => void
  setProfile: (profile: Profile) => void
  setCurrentInvoice: (invoice: Invoice | null) => void
  addInvoice: (invoice: Invoice) => Promise<{ success: boolean; error?: string }>
  updateInvoice: (invoice: Invoice) => Promise<{ success: boolean; error?: string }>
  deleteInvoice: (id: number) => void
  restoreInvoice: (invoice: Invoice) => void
  addCustomer: (customer: Customer) => Promise<{ success: boolean; error?: string }>
  updateCustomer: (customer: Customer) => Promise<{ success: boolean; error?: string }>
  deleteCustomer: (id: number) => void
  restoreCustomer: (customer: Customer) => void
  exportData: () => Promise<{ success: boolean; data?: unknown; error?: string }>
  importData: (data: unknown) => Promise<{ success: boolean; error?: string }>
}

const DataContext = createContext<DataContextType | undefined>(undefined)

// Default sample data
const DEFAULT_INVOICES: Invoice[] = [
  {
    id: 1,
    number: 'RE-001-001',
    date: '2025-01-01',
    dueDate: '2025-01-15',
    customerId: 1,
    customerName: 'Max Mustermann GmbH',
    amount: 1500.00,
    description: 'Webentwicklung',
    paid: true,
    items: [
      {
        name: 'Webentwicklung',
        amount: 1200.00,
        quantity: 1,
        description: 'Entwicklung einer modernen Website mit:\n• Responsive Design\n• Content Management System\n• SEO-Optimierung'
      },
      {
        name: 'Domain Setup',
        amount: 300.00,
        quantity: 1,
        description: 'Einrichtung und Konfiguration der Domain'
      }
    ]
  },
  {
    id: 2,
    number: 'RE-002-001',
    date: '2025-01-03',
    dueDate: '2025-01-17',
    customerId: 2,
    customerName: 'Beispiel AG',
    amount: 2250.00,
    description: 'Beratungsleistungen',
    paid: false,
    items: [
      {
        name: 'IT-Beratung',
        amount: 1500.00,
        quantity: 1,
        description: 'Strategische IT-Beratung für digitale Transformation'
      },
      {
        name: 'Projektmanagement',
        amount: 750.00,
        quantity: 1,
        description: 'Koordination und Überwachung der Projektdurchführung'
      }
    ]
  }
]

const DEFAULT_CUSTOMERS: Customer[] = [
  {
    id: 1,
    customerNumber: '001',
    name: 'Max Mustermann GmbH',
    email: 'max@mustermann.de',
    address: 'Musterstraße 1\n12345 Musterstadt',
  },
  {
    id: 2,
    customerNumber: '002',
    name: 'Beispiel AG',
    email: 'kontakt@beispiel.de',
    address: 'Beispielweg 10\n54321 Beispielhausen',
  }
]

const DEFAULT_PROFILE: Profile = {
  companyName: 'Max Mustermann',
  companyStreet: 'Musterstraße 1',
  companyZip: '12345',
  companyCity: 'Musterstadt',
  companyEmail: 'max@mustermann.de',
  companyPhone: '+49 123 456789',
  taxNumber: '12/345/67890',
  vatId: '',
  smallBusinessId: '',
  taxNotice: 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.',
  bankName: 'Musterbank',
  bankIban: 'DE12 3456 7890 1234 5678 90',
  bankBic: 'MUSTDE12',
}

function DataProviderInner({ children }: { children: React.ReactNode }) {
  // Use secure storage for sensitive data with encryption
  const [invoices, setInvoicesSecure, , invoicesLoading] = useSecureStorage<Invoice[]>(
    'fyniq_invoices', 
    DEFAULT_INVOICES, 
    { encrypt: true, validateIntegrity: true }
  )
  
  const [customers, setCustomersSecure, , customersLoading] = useSecureStorage<Customer[]>(
    'fyniq_customers', 
    DEFAULT_CUSTOMERS, 
    { encrypt: true, validateIntegrity: true }
  )
  
  const [profile, setProfileSecure, , profileLoading] = useSecureStorage<Profile>(
    'fyniq_profile', 
    DEFAULT_PROFILE, 
    { encrypt: true, validateIntegrity: true }
  )

  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  type AuditEntry = {
    timestamp: string
    action: string
    entityId: number | null
    data: Record<string, unknown>
  }
  const [auditLog, setAuditLog] = useState<AuditEntry[]>([])

  const isLoading = invoicesLoading || customersLoading || profileLoading

  // Memoized context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    invoices,
    customers,
    profile,
    currentInvoice,
    isLoading,
    setInvoices: setInvoicesSecure,
    setCustomers: setCustomersSecure,
    setProfile: setProfileSecure,
    setCurrentInvoice,
    addInvoice: async (invoice: Invoice) => {
      try {
        const validation = validateAndSanitize(invoiceSchema, invoice)
        if (!validation.success) {
          return { success: false, error: validation.errors?.join(', ') }
        }
        
        const newInvoices = [...invoices, validation.data!]
        setInvoicesSecure(newInvoices)
        
        // Log audit trail
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'ADD_INVOICE',
          entityId: invoice.id,
          data: { invoiceNumber: invoice.number, amount: invoice.amount }
        }
        setAuditLog(prev => [...prev, auditEntry])
        
        return { success: true }
      } catch (error) {
        console.error('Error adding invoice:', error)
        return { success: false, error: 'Fehler beim Hinzufügen der Rechnung' }
      }
    },
    updateInvoice: async (invoice: Invoice) => {
      try {
        const validation = validateAndSanitize(invoiceSchema, invoice)
        if (!validation.success) {
          return { success: false, error: validation.errors?.join(', ') }
        }
        
        const updatedInvoices = invoices.map(inv => inv.id === invoice.id ? validation.data! : inv)
        setInvoicesSecure(updatedInvoices)
        
        // Log audit trail
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'UPDATE_INVOICE',
          entityId: invoice.id,
          data: { invoiceNumber: invoice.number, amount: invoice.amount }
        }
        setAuditLog(prev => [...prev, auditEntry])
        
        return { success: true }
      } catch (error) {
        console.error('Error updating invoice:', error)
        return { success: false, error: 'Fehler beim Aktualisieren der Rechnung' }
      }
    },
    deleteInvoice: (id: number) => {
      try {
        const deletedInvoice = invoices.find(inv => inv.id === id)
        const updatedInvoices = invoices.filter(inv => inv.id !== id)
        setInvoicesSecure(updatedInvoices)
        
        // Log audit trail
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'DELETE_INVOICE',
          entityId: id,
          data: { invoiceNumber: deletedInvoice?.number }
        }
        setAuditLog(prev => [...prev, auditEntry])
      } catch (error) {
        console.error('Error deleting invoice:', error)
      }
    },
    restoreInvoice: (invoice: Invoice) => {
      try {
        const newInvoices = [...invoices, invoice]
        setInvoicesSecure(newInvoices)
        
        // Log audit trail
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'RESTORE_INVOICE',
          entityId: invoice.id,
          data: { invoiceNumber: invoice.number }
        }
        setAuditLog(prev => [...prev, auditEntry])
      } catch (error) {
        console.error('Error restoring invoice:', error)
      }
    },
    addCustomer: async (customer: Customer) => {
      try {
        const validation = validateAndSanitize(customerSchema, customer)
        if (!validation.success) {
          return { success: false, error: validation.errors?.join(', ') }
        }
        
        const newCustomers = [...customers, validation.data!]
        setCustomersSecure(newCustomers)
        
        // Log audit trail
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'ADD_CUSTOMER',
          entityId: customer.id,
          data: { customerName: customer.name, email: customer.email }
        }
        setAuditLog(prev => [...prev, auditEntry])
        
        return { success: true }
      } catch (error) {
        console.error('Error adding customer:', error)
        return { success: false, error: 'Fehler beim Hinzufügen des Kunden' }
      }
    },
    updateCustomer: async (customer: Customer) => {
      try {
        const validation = validateAndSanitize(customerSchema, customer)
        if (!validation.success) {
          return { success: false, error: validation.errors?.join(', ') }
        }
        
        const updatedCustomers = customers.map(cust => cust.id === customer.id ? validation.data! : cust)
        setCustomersSecure(updatedCustomers)
        
        // Log audit trail
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'UPDATE_CUSTOMER',
          entityId: customer.id,
          data: { customerName: customer.name, email: customer.email }
        }
        setAuditLog(prev => [...prev, auditEntry])
        
        return { success: true }
      } catch (error) {
        console.error('Error updating customer:', error)
        return { success: false, error: 'Fehler beim Aktualisieren des Kunden' }
      }
    },
    deleteCustomer: (id: number) => {
      try {
        const deletedCustomer = customers.find(cust => cust.id === id)
        const updatedCustomers = customers.filter(cust => cust.id !== id)
        setCustomersSecure(updatedCustomers)
        
        // Log audit trail
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'DELETE_CUSTOMER',
          entityId: id,
          data: { customerName: deletedCustomer?.name }
        }
        setAuditLog(prev => [...prev, auditEntry])
      } catch (error) {
        console.error('Error deleting customer:', error)
      }
    },
    restoreCustomer: (customer: Customer) => {
      try {
        const newCustomers = [...customers, customer]
        setCustomersSecure(newCustomers)
        
        // Log audit trail
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'RESTORE_CUSTOMER',
          entityId: customer.id,
          data: { customerName: customer.name }
        }
        setAuditLog(prev => [...prev, auditEntry])
      } catch (error) {
        console.error('Error restoring customer:', error)
      }
    },
    exportData: async () => {
      try {
        const exportData = {
          invoices,
          customers,
          profile,
          auditLog,
          exportedAt: new Date().toISOString(),
          version: '1.0'
        }
        
        // Log audit trail
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'EXPORT_DATA',
          entityId: null,
          data: { itemCount: invoices.length + customers.length }
        }
        setAuditLog(prev => [...prev, auditEntry])
        
        return { success: true, data: exportData }
      } catch (error) {
        console.error('Error exporting data:', error)
        return { success: false, error: 'Fehler beim Exportieren der Daten' }
      }
    },
    importData: async (data: unknown) => {
      try {
        // Validate imported data structure
        if (!data || typeof data !== 'object') {
          return { success: false, error: 'Ungültiges Datenformat' }
        }
        
        const typedData = data as Record<string, unknown>
        
        if (typedData.invoices && Array.isArray(typedData.invoices)) {
          setInvoicesSecure(typedData.invoices as Invoice[])
        }
        
        if (typedData.customers && Array.isArray(typedData.customers)) {
          setCustomersSecure(typedData.customers as Customer[])
        }
        
        if (typedData.profile && typeof typedData.profile === 'object') {
          setProfileSecure(typedData.profile as Profile)
        }
        
        // Log audit trail
        const auditEntry = {
          timestamp: new Date().toISOString(),
          action: 'IMPORT_DATA',
          entityId: null,
          data: { 
            invoiceCount: (typedData.invoices as unknown[])?.length || 0,
            customerCount: (typedData.customers as unknown[])?.length || 0
          }
        }
        setAuditLog(prev => [...prev, auditEntry])
        
        return { success: true }
      } catch (error) {
        console.error('Error importing data:', error)
        return { success: false, error: 'Fehler beim Importieren der Daten' }
      }
    }
  }), [
    invoices, customers, profile, currentInvoice, isLoading, auditLog,
    setInvoicesSecure, setCustomersSecure, setProfileSecure
  ])

  return (
    <DataContext.Provider value={contextValue}>
      {children}
    </DataContext.Provider>
  )
}

export function DataProvider({ children }: { children: React.ReactNode }) {
  return (
    <ErrorBoundary level="critical" onError={(error) => {
      console.error('Critical error in DataProvider:', error)
    }}>
      <DataProviderInner>{children}</DataProviderInner>
    </ErrorBoundary>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}