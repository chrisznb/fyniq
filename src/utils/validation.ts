import { z } from 'zod'
import DOMPurify from 'dompurify'

/**
 * Validation schemas and utilities for form data
 * Includes XSS protection and comprehensive validation
 */

// Custom string validation with XSS protection
const sanitizedString = (minLength = 0, maxLength = 1000) => 
  z.string()
    .min(minLength, `Mindestens ${minLength} Zeichen erforderlich`)
    .max(maxLength, `Maximal ${maxLength} Zeichen erlaubt`)
    .transform(val => DOMPurify.sanitize(val.trim()))

// Email validation
const emailSchema = z.string()
  .email('Ungültige E-Mail-Adresse')
  .transform(val => DOMPurify.sanitize(val.trim().toLowerCase()))

// Phone number validation (German format)
const phoneSchema = z.string()
  .regex(/^(\+49|0)[1-9][0-9]{1,14}$/, 'Ungültige Telefonnummer')
  .transform(val => DOMPurify.sanitize(val.trim()))
  .optional()

// Currency amount validation
const currencySchema = z.number()
  .min(0, 'Betrag muss positiv sein')
  .max(999999.99, 'Betrag zu hoch')
  .multipleOf(0.01, 'Maximal 2 Nachkommastellen')

// Tax ID validation (German format)
const taxIdSchema = z.string()
  .regex(/^[0-9]{2}\/[0-9]{3}\/[0-9]{5}$/, 'Ungültige Steuernummer (Format: 12/345/67890)')
  .transform(val => DOMPurify.sanitize(val.trim()))
  .optional()

// VAT ID validation (German format)
const vatIdSchema = z.string()
  .regex(/^DE[0-9]{9}$/, 'Ungültige USt-IdNr. (Format: DE123456789)')
  .transform(val => DOMPurify.sanitize(val.trim().toUpperCase()))
  .optional()

// IBAN validation
const ibanSchema = z.string()
  .regex(/^[A-Z]{2}[0-9]{2}[A-Z0-9]{4}[0-9]{7}([A-Z0-9]?){0,16}$/, 'Ungültige IBAN')
  .transform(val => DOMPurify.sanitize(val.trim().toUpperCase()))
  .optional()

// BIC validation
const bicSchema = z.string()
  .regex(/^[A-Z]{4}[A-Z]{2}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'Ungültige BIC')
  .transform(val => DOMPurify.sanitize(val.trim().toUpperCase()))
  .optional()

// Invoice Item Schema
export const invoiceItemSchema = z.object({
  name: sanitizedString(1, 100),
  description: sanitizedString(0, 500).optional(),
  quantity: z.number().min(1, 'Menge muss mindestens 1 sein').max(9999, 'Menge zu hoch'),
  amount: currencySchema
})

// Invoice Schema
export const invoiceSchema = z.object({
  id: z.number().optional(),
  number: sanitizedString(1, 50),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ungültiges Datum'),
  customerId: z.number().min(1, 'Kunde muss ausgewählt werden'),
  customerName: sanitizedString(1, 100),
  amount: currencySchema,
  description: sanitizedString(1, 500),
  paid: z.boolean(),
  items: z.array(invoiceItemSchema).min(1, 'Mindestens ein Artikel erforderlich').optional()
}).refine((data) => {
  // Validate that due date is not before invoice date
  const invoiceDate = new Date(data.date)
  const dueDate = new Date(data.dueDate)
  return dueDate >= invoiceDate
}, {
  message: 'Fälligkeitsdatum muss nach dem Rechnungsdatum liegen',
  path: ['dueDate']
})

// Customer Schema
export const customerSchema = z.object({
  id: z.number().optional(),
  customerNumber: sanitizedString(1, 20),
  name: sanitizedString(1, 100),
  company: sanitizedString(0, 100).optional(),
  email: emailSchema,
  address: sanitizedString(1, 500),
  taxId: taxIdSchema
})

// Profile Schema
export const profileSchema = z.object({
  companyName: sanitizedString(1, 100),
  companyStreet: sanitizedString(1, 100),
  companyZip: sanitizedString(1, 10),
  companyCity: sanitizedString(1, 50),
  companyEmail: emailSchema,
  companyPhone: phoneSchema,
  taxNumber: sanitizedString(1, 20),
  vatId: vatIdSchema,
  smallBusinessId: sanitizedString(0, 50).optional(),
  taxNotice: sanitizedString(0, 500),
  bankName: sanitizedString(0, 100).optional(),
  bankIban: ibanSchema,
  bankBic: bicSchema
})

// Consent Settings Schema
export const consentSchema = z.object({
  necessary: z.boolean().default(true),
  analytics: z.boolean().default(false),
  preferences: z.boolean().default(false),
  timestamp: z.string().datetime()
})

// Feedback Schema
export const feedbackSchema = z.object({
  rating: z.number().min(1, 'Bewertung erforderlich').max(5, 'Bewertung zu hoch'),
  comment: sanitizedString(0, 1000).optional(),
  category: z.enum(['feature', 'bug', 'improvement', 'other']).optional(),
  timestamp: z.string().datetime()
})

// Type exports for TypeScript
export type InvoiceItem = z.infer<typeof invoiceItemSchema>
export type Invoice = z.infer<typeof invoiceSchema>
export type Customer = z.infer<typeof customerSchema>
export type Profile = z.infer<typeof profileSchema>
export type ConsentSettings = z.infer<typeof consentSchema>
export type Feedback = z.infer<typeof feedbackSchema>

/**
 * Validation utility functions
 */

// Sanitize HTML content
export const sanitizeHtml = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: []
  })
}

// Validate and sanitize form data
export const validateAndSanitize = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean
  data?: T
  errors?: string[]
} => {
  try {
    const result = schema.safeParse(data)
    
    if (result.success) {
      return { success: true, data: result.data }
    } else {
      const errors = result.error.issues.map(issue => 
        `${issue.path.join('.')}: ${issue.message}`
      )
      return { success: false, errors }
    }
  } catch (error) {
    return { 
      success: false, 
      errors: ['Validierung fehlgeschlagen: ' + (error as Error).message] 
    }
  }
}

// Batch validation for multiple items
export const validateBatch = <T>(
  schema: z.ZodSchema<T>, 
  items: unknown[]
): { success: boolean; validItems: T[]; errors: string[] } => {
  const validItems: T[] = []
  const errors: string[] = []

  items.forEach((item, index) => {
    const result = validateAndSanitize(schema, item)
    if (result.success && result.data) {
      validItems.push(result.data)
    } else {
      errors.push(`Item ${index + 1}: ${result.errors?.join(', ')}`)
    }
  })

  return {
    success: errors.length === 0,
    validItems,
    errors
  }
}

// Validate file upload
export const validateFileUpload = (file: File, maxSize = 5 * 1024 * 1024): {
  success: boolean
  error?: string
} => {
  const allowedTypes = ['application/json', 'text/plain']
  
  if (!allowedTypes.includes(file.type)) {
    return { success: false, error: 'Nur JSON und Text-Dateien sind erlaubt' }
  }
  
  if (file.size > maxSize) {
    return { success: false, error: `Datei zu groß (max. ${maxSize / 1024 / 1024}MB)` }
  }
  
  return { success: true }
}