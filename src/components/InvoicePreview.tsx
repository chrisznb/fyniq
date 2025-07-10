'use client'

import { useData } from '@/contexts/DataContext'
import { useUserActivity } from '@/contexts/UserActivityContext'
import { ViewType } from '@/types'
import { formatCurrency, formatDate } from '@/utils/helpers'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

interface InvoicePreviewProps {
  setCurrentView: (view: ViewType) => void
}

export default function InvoicePreview({ setCurrentView }: InvoicePreviewProps) {
  const { currentInvoice, customers, profile } = useData()
  const { } = useUserActivity()

  if (!currentInvoice) {
    return (
      <div className="text-center py-8">
        <p className="text-[var(--muted)]">Keine Rechnung ausgewählt.</p>
        <button 
          onClick={() => setCurrentView('invoices')}
          className="mt-4 px-6 py-3 bg-[var(--accent)] border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all"
        >
          Zurück zu Rechnungen
        </button>
      </div>
    )
  }

  const customer = customers.find(c => c.id === currentInvoice.customerId)
  
  // Get tax identification for display
  const taxId = profile.smallBusinessId || profile.vatId || profile.taxNumber || ''

  const sendInvoiceByEmail = () => {
    if (!currentInvoice || !customer) return
    
    const subject = encodeURIComponent(`Rechnung ${currentInvoice.number}`)
    const body = encodeURIComponent(
      `Sehr geehrte Damen und Herren,\n\n` +
      `anbei erhalten Sie die Rechnung ${currentInvoice.number} vom ${formatDate(currentInvoice.date)}.\n\n` +
      `Rechnungsbetrag: ${formatCurrency(currentInvoice.amount)}\n` +
      `Zahlbar bis: ${formatDate(currentInvoice.dueDate)}\n\n` +
      `Bitte überweisen Sie den Betrag bis zum Fälligkeitsdatum auf unser Konto.\n\n` +
      `Mit freundlichen Grüßen\n` +
      `${profile.companyName || 'Ihr Unternehmen'}`
    )
    
    window.location.href = `mailto:${customer?.email || ''}?subject=${subject}&body=${body}`
  }

  const downloadPDF = async () => {
    if (!currentInvoice || !customer) return

    // Get the invoice content element
    const invoiceElement = document.getElementById('invoice-to-pdf')
    if (!invoiceElement) return

    try {
      // Add PDF export class to fix color compatibility and force desktop layout
      invoiceElement.classList.add('pdf-export')
      invoiceElement.classList.add('pdf-desktop-layout')
      
      // Force style recomputation by triggering a reflow
      void invoiceElement.offsetHeight
      
      // Wait a bit for styles to be applied
      await new Promise(resolve => setTimeout(resolve, 100))

      // Ensure we capture the full height of the content
      const fullHeight = Math.max(
        invoiceElement.scrollHeight,
        invoiceElement.offsetHeight,
        invoiceElement.clientHeight
      )
      
      // Create canvas from the invoice content
      // Using type assertion for html2canvas options due to outdated type definitions
      const options = {
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: invoiceElement.scrollWidth,
        height: fullHeight,
        scale: 1.5,
        removeContainer: true,
        logging: false, // Disable logging to reduce console noise
        scrollX: 0,
        scrollY: 0,
        onclone: (clonedDoc: Document) => {
          // Ensure the cloned document also has PDF export styles and desktop layout
          const clonedElement = clonedDoc.getElementById('invoice-to-pdf')
          if (clonedElement) {
            clonedElement.classList.add('pdf-export')
            clonedElement.classList.add('pdf-desktop-layout')
            // Force all elements to use RGB colors
            const allElements = clonedElement.querySelectorAll('*')
            allElements.forEach(el => {
              const element = el as HTMLElement
              const computedStyle = window.getComputedStyle(element)
              
              // Convert any remaining oklch colors to RGB
              if (computedStyle.backgroundColor && computedStyle.backgroundColor.includes('oklch')) {
                element.style.backgroundColor = '#ffffff'
              }
              if (computedStyle.color && computedStyle.color.includes('oklch')) {
                element.style.color = '#000000'
              }
              if (computedStyle.borderColor && computedStyle.borderColor.includes('oklch')) {
                element.style.borderColor = '#000000'
              }
            })
          }
        },
        ignoreElements: (element: Element) => {
          return element.classList?.contains('no-print') || false
        },
      }
      const canvas = await html2canvas(invoiceElement, options as Parameters<typeof html2canvas>[1])

      // Remove PDF export classes
      invoiceElement.classList.remove('pdf-export')
      invoiceElement.classList.remove('pdf-desktop-layout')

      // Calculate PDF dimensions
      const pdf = new jsPDF('p', 'mm', 'a4')
      
      // A4 dimensions in mm
      const pdfWidth = 210
      const pdfHeight = 297
      const margin = 10 // Standard margin for desktop layout
      const availableWidth = pdfWidth - (2 * margin)
      const availableHeight = pdfHeight - (2 * margin)
      
      // Calculate image dimensions to fit A4 width
      const imgWidth = availableWidth
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      console.log('PDF Debug:', {
        canvasHeight: canvas.height,
        canvasWidth: canvas.width,
        imgHeight,
        availableHeight,
        willFit: imgHeight <= availableHeight
      })
      
      // Always use multi-page approach to ensure no content is cut off
      const pageHeight = availableHeight
      const totalPages = Math.max(1, Math.ceil(imgHeight / pageHeight))
      
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) {
          pdf.addPage()
        }
        
        // Calculate the source area for this page
        const sourceYRatio = (page * pageHeight) / imgHeight
        const sourceY = sourceYRatio * canvas.height
        const remainingCanvasHeight = canvas.height - sourceY
        const pageHeightInCanvas = Math.min(
          (pageHeight / imgHeight) * canvas.height,
          remainingCanvasHeight
        )
        
        // Create a canvas for this page
        const pageCanvas = document.createElement('canvas')
        const pageCtx = pageCanvas.getContext('2d')
        
        if (!pageCtx) continue
        
        pageCanvas.width = canvas.width
        pageCanvas.height = pageHeightInCanvas
        
        // Fill with white background first
        pageCtx.fillStyle = '#ffffff'
        pageCtx.fillRect(0, 0, canvas.width, pageHeightInCanvas)
        
        // Draw the portion of the original canvas for this page
        pageCtx.drawImage(
          canvas,
          0, sourceY, canvas.width, pageHeightInCanvas,
          0, 0, canvas.width, pageHeightInCanvas
        )
        
        const pageImgData = pageCanvas.toDataURL('image/png')
        const actualPageHeight = (pageHeightInCanvas * imgWidth) / canvas.width
        
        pdf.addImage(pageImgData, 'PNG', margin, margin, imgWidth, actualPageHeight)
      }

      // Save the PDF
      pdf.save(`${currentInvoice.number}.pdf`)
      
      // Note: The intelligent feedback timing is handled automatically by the 
      // UserActivity context when an invoice is created (not on PDF download)
      // The primary trigger is after first invoice creation, not PDF download
    } catch (error) {
      console.error('Fehler beim Erstellen der PDF:', error)
      // Remove PDF export class in case of error
      invoiceElement.classList.remove('pdf-export')
      
      // Show user-friendly error message
      const errorMessage = error instanceof Error ? error.message : ''
      if (errorMessage.includes('oklch') || errorMessage.includes('color')) {
        alert('PDF-Generierung fehlgeschlagen: Farbkompatibilitätsproblem. Bitte versuchen Sie es erneut.')
      } else {
        alert('Fehler beim Erstellen der PDF. Bitte versuchen Sie es erneut.')
      }
    }
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0 mb-4 sm:mb-6 flex-shrink-0 no-print">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">Rechnungsvorschau</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={downloadPDF}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-[var(--accent)] text-black border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
          >
            PDF Download
          </button>
          <button
            onClick={sendInvoiceByEmail}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-blue-100 text-black border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
          >
            Per E-Mail versenden
          </button>
          <button 
            onClick={() => setCurrentView('invoices')}
            className="px-4 sm:px-6 py-2 sm:py-3 bg-gray-200 border-3 border-black rounded-lg font-semibold hover:shadow-lg transition-all text-sm sm:text-base"
          >
            Zurück
          </button>
        </div>
      </div>

      {/* Invoice Preview Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto bg-white border-3 border-black rounded-lg p-3 sm:p-6 lg:p-8 print:border-none print:shadow-none">
          <div className="invoice-preview" id="invoice-to-pdf">
            {/* Invoice Header */}
            <div className="invoice-preview-header flex flex-col lg:flex-row lg:justify-between lg:items-start gap-6 lg:gap-0">
              <div className="invoice-preview-from text-left">
                <p className="font-bold text-sm sm:text-base">{profile.companyName || 'Dein Unternehmen'}</p>
                <p className="text-sm sm:text-base">{profile.companyStreet || 'Musterstraße 1'}</p>
                <p className="text-sm sm:text-base">{profile.companyZip || '12345'} {profile.companyCity || 'Musterstadt'}</p>
                {profile.companyEmail && <p className="text-sm sm:text-base">{profile.companyEmail}</p>}
                {profile.companyPhone && <p className="text-sm sm:text-base">Tel: {profile.companyPhone}</p>}
              </div>
              <div className="invoice-preview-details text-left lg:text-right">
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold mb-3 sm:mb-5">RECHNUNG</h1>
                <p className="text-sm sm:text-base mb-1"><strong>Rechnungsnummer:</strong> {currentInvoice.number}</p>
                <p className="text-sm sm:text-base mb-1"><strong>Rechnungsdatum:</strong> {formatDate(currentInvoice.date)}</p>
                <p className="text-sm sm:text-base mb-1"><strong>Leistungsdatum:</strong> {formatDate(currentInvoice.date)}</p>
                {taxId && <p className="text-sm sm:text-base"><strong>Steuer-ID:</strong> {taxId}</p>}
              </div>
            </div>

            {/* Customer Information */}
            <div className="invoice-preview-parties mt-6 sm:mt-8 lg:mt-10">
              <div className="invoice-preview-to">
                <p className="text-xs sm:text-sm mb-2">Rechnungsempfänger:</p>
                <p className="font-bold text-sm sm:text-base">{customer ? customer.name : currentInvoice.customerName}</p>
                {customer && customer.company && <p className="text-sm sm:text-base">{customer.company}</p>}
                {customer && customer.taxId && <p className="text-sm sm:text-base">USt-ID: {customer.taxId}</p>}
                {customer && customer.address && (
                  <div>
                    {customer.address.split('\n').map((line, idx) => (
                      <p key={idx} className="text-sm sm:text-base">{line}</p>
                    ))}
                  </div>
                )}
                {customer && <p className="text-sm sm:text-base">{customer.email}</p>}
              </div>
            </div>

            {/* Invoice Items */}
            <div className="invoice-preview-items mt-6 sm:mt-8 p-3 sm:p-4 bg-[var(--accent)] border-3 border-black rounded-lg">
              <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Leistungsbeschreibung</h3>
              {currentInvoice.items && currentInvoice.items.length > 0 ? (
                <div>
                  {currentInvoice.items.map((item, index) => (
                    <div 
                      key={index} 
                      className={`p-2 sm:p-4 bg-[var(--accent)] rounded-lg ${item.description ? 'mb-3 sm:mb-5' : 'mb-2'}`}
                      style={{ marginBottom: item.description ? '20px' : '8px', padding: 'clamp(8px, 2vw, 16px)', borderRadius: '8px', backgroundColor: 'var(--accent)' }}
                    >
                      <div 
                        className="flex justify-between items-center mb-2"
                        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-3">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
                            <strong className="text-sm sm:text-base">{item.name}</strong>
                            {item.quantity && item.quantity > 1 && (
                              <span className="text-xs sm:text-sm text-gray-700">({item.quantity}x {formatCurrency(item.amount || 0)})</span>
                            )}
                          </div>
                          <span className="text-sm sm:text-base font-medium">{formatCurrency((item.amount || 0) * (item.quantity || 1))}</span>
                        </div>
                      </div>
                      {item.description && (
                        <div 
                          className="mt-2 text-xs sm:text-sm text-gray-600 leading-relaxed invoice-description whitespace-pre-wrap"
                          style={{ margin: '8px 0', fontSize: 'clamp(12px, 2vw, 14px)', color: '#666', lineHeight: '1.4' }}
                        >
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p>{currentInvoice.description || 'Keine Beschreibung'}</p>
              )}
            </div>

            {/* Total Amount */}
            <div className="invoice-preview-total mt-6 sm:mt-8 text-left sm:text-right">
              <p className="text-base sm:text-lg"><strong>Nettobetrag:</strong> {formatCurrency(currentInvoice.amount)}</p>
              <p 
                className="text-xs sm:text-sm text-[var(--muted)] my-3 sm:my-4"
                style={{ fontSize: 'clamp(12px, 2vw, 14px)', color: 'var(--muted)', margin: '12px 0' }}
              >
                {profile.taxNotice || 'Gemäß § 19 UStG wird keine Umsatzsteuer berechnet.'}
              </p>
              <p className="text-lg sm:text-xl lg:text-2xl font-bold border-t border-gray-200 pt-2">
                <strong>Gesamtbetrag:</strong> {formatCurrency(currentInvoice.amount)}
              </p>
            </div>

            {/* Payment Information */}
            <div className="invoice-preview-payment mt-6 sm:mt-8 text-center">
              <div className="bg-gray-100 border-3 border-black rounded-lg p-3 sm:p-6">
                <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">Zahlungsinformationen</h3>
                <p className="mb-2 sm:mb-3 text-sm sm:text-base lg:text-lg text-gray-500"><strong>Zahlbar bis:</strong> {formatDate(currentInvoice.dueDate)}</p>
                
                {(profile.bankName || profile.bankIban) ? (
                  <div style={{ marginTop: '12px' }}>
                    <p className="mb-2 text-sm sm:text-base lg:text-lg text-gray-500"><strong>Bankverbindung:</strong></p>
                    {profile.bankName && <p className="text-sm sm:text-base lg:text-lg text-gray-500">Bank: {profile.bankName}</p>}
                    {profile.bankIban && <p className="text-sm sm:text-base lg:text-lg text-gray-500">IBAN: {profile.bankIban}</p>}
                    {profile.bankBic && <p className="text-sm sm:text-base lg:text-lg text-gray-500">BIC: {profile.bankBic}</p>}
                  </div>
                ) : (
                  <p className="text-sm sm:text-base lg:text-lg text-gray-500">Bitte überweisen Sie den Betrag auf unser Konto.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}