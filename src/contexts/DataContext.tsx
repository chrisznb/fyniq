'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { Invoice, Customer, Profile } from '@/types'

interface DataContextType {
  invoices: Invoice[]
  customers: Customer[]
  profile: Profile
  currentInvoice: Invoice | null
  setInvoices: (invoices: Invoice[]) => void
  setCustomers: (customers: Customer[]) => void
  setProfile: (profile: Profile) => void
  setCurrentInvoice: (invoice: Invoice | null) => void
  addInvoice: (invoice: Invoice) => void
  updateInvoice: (invoice: Invoice) => void
  deleteInvoice: (id: number) => void
  restoreInvoice: (invoice: Invoice) => void
  addCustomer: (customer: Customer) => void
  updateCustomer: (customer: Customer) => void
  deleteCustomer: (id: number) => void
  restoreCustomer: (customer: Customer) => void
}

const DataContext = createContext<DataContextType | undefined>(undefined)

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [currentInvoice, setCurrentInvoice] = useState<Invoice | null>(null)
  const [profile, setProfile] = useState<Profile>({
    companyName: '',
    companyStreet: '',
    companyZip: '',
    companyCity: '',
    companyEmail: '',
    companyPhone: '',
    taxNumber: '',
    vatId: '',
    smallBusinessId: '',
    taxNotice: '',
    bankName: '',
    bankIban: '',
    bankBic: '',
  })

  // Load data from localStorage on mount
  useEffect(() => {
    const savedInvoices = localStorage.getItem('fyniq_invoices')
    const savedCustomers = localStorage.getItem('fyniq_customers')
    const savedProfile = localStorage.getItem('fyniq_profile')

    if (savedInvoices) {
      setInvoices(JSON.parse(savedInvoices))
    } else {
      // Add sample data if no saved data exists
      const sampleInvoices: Invoice[] = [
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
      setInvoices(sampleInvoices)
    }

    if (savedCustomers) {
      setCustomers(JSON.parse(savedCustomers))
    } else {
      // Add sample customers
      const sampleCustomers: Customer[] = [
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
      setCustomers(sampleCustomers)
    }

    if (savedProfile) {
      setProfile(JSON.parse(savedProfile))
    } else {
      // Set sample profile
      setProfile({
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
      })
    }
  }, [])

  // Save to localStorage when data changes
  useEffect(() => {
    localStorage.setItem('fyniq_invoices', JSON.stringify(invoices))
  }, [invoices])

  useEffect(() => {
    localStorage.setItem('fyniq_customers', JSON.stringify(customers))
  }, [customers])

  useEffect(() => {
    localStorage.setItem('fyniq_profile', JSON.stringify(profile))
  }, [profile])

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [...prev, invoice])
  }

  const updateInvoice = (invoice: Invoice) => {
    setInvoices(prev => prev.map(inv => inv.id === invoice.id ? invoice : inv))
  }

  const deleteInvoice = (id: number) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id))
  }

  const restoreInvoice = (invoice: Invoice) => {
    setInvoices(prev => [...prev, invoice])
  }

  const addCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer])
  }

  const updateCustomer = (customer: Customer) => {
    setCustomers(prev => prev.map(cust => cust.id === customer.id ? customer : cust))
  }

  const deleteCustomer = (id: number) => {
    setCustomers(prev => prev.filter(cust => cust.id !== id))
  }

  const restoreCustomer = (customer: Customer) => {
    setCustomers(prev => [...prev, customer])
  }

  return (
    <DataContext.Provider value={{
      invoices,
      customers,
      profile,
      currentInvoice,
      setInvoices,
      setCustomers,
      setProfile,
      setCurrentInvoice,
      addInvoice,
      updateInvoice,
      deleteInvoice,
      restoreInvoice,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      restoreCustomer,
    }}>
      {children}
    </DataContext.Provider>
  )
}

export function useData() {
  const context = useContext(DataContext)
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider')
  }
  return context
}