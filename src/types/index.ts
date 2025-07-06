export interface Invoice {
  id: number
  number: string
  date: string
  dueDate: string
  customerId: number
  customerName: string
  amount: number
  description: string
  paid: boolean
  items?: InvoiceItem[]
}

export interface InvoiceItem {
  name: string
  amount: number
  quantity: number
  description?: string
}

export interface Customer {
  id: number
  customerNumber: string
  name: string
  company?: string
  email: string
  address: string
  taxId?: string
}

export interface Profile {
  companyName: string
  companyStreet: string
  companyZip: string
  companyCity: string
  companyEmail: string
  companyPhone?: string
  taxNumber: string
  vatId?: string
  smallBusinessId?: string
  taxNotice: string
  bankName?: string
  bankIban?: string
  bankBic?: string
}

export type ViewType = 'dashboard' | 'invoices' | 'customers' | 'profile' | 'invoice-preview'