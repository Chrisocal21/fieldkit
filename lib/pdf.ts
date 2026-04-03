import { Quote } from '@/store/quoteStore'
import { Invoice } from '@/store/invoiceStore'
import jsPDF from 'jspdf'
import { BrandingPreset, useBrandingStore } from '@/store/brandingStore'

// Helper to convert hex color to RGB
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [0, 0, 0]
}

export function generateQuotePDF(quote: Quote, presetId?: string) {
  const preset = presetId 
    ? useBrandingStore.getState().getPresetById(presetId) 
    : useBrandingStore.getState().getDefaultPreset()
  
  if (!preset) {
    throw new Error('No branding preset found')
  }
  
  generateDocumentPDF('quote', quote, preset)
}

export function generateInvoicePDF(invoice: Invoice, presetId?: string) {
  const preset = presetId 
    ? useBrandingStore.getState().getPresetById(presetId) 
    : useBrandingStore.getState().getDefaultPreset()
  
  if (!preset) {
    throw new Error('No branding preset found')
  }
  
  generateDocumentPDF('invoice', invoice, preset)
}

function generateDocumentPDF(
  type: 'quote' | 'invoice',
  document: Quote | Invoice,
  preset: BrandingPreset
) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  let yPos = 20

  // Extract color values
  const primaryRgb = hexToRgb(preset.colors.primary)
  const accentRgb = hexToRgb(preset.accentColor)
  
  // Logo
  if (preset.logoUrl) {
    try {
      const logoHeight = 20
      let logoXPos = 20
      
      if (preset.logoPosition === 'center') {
        logoXPos = (pageWidth - preset.logoWidth) / 2
      } else if (preset.logoPosition === 'right') {
        logoXPos = pageWidth - preset.logoWidth - 20
      }
      
      doc.addImage(preset.logoUrl, 'PNG', logoXPos, yPos, preset.logoWidth, logoHeight)
      yPos += logoHeight + 10
    } catch (error) {
      console.error('Error adding logo to PDF:', error)
    }
  }

  // Header - Document Type
  doc.setTextColor(...primaryRgb)
  doc.setFontSize(preset.fontSize.title)
  doc.setFont('helvetica', 'bold')
  
  const docTitle = type === 'quote' ? 'QUOTE' : 'INVOICE'
  const docNumber = type === 'quote' 
    ? (document as Quote).quoteNumber 
    : (document as Invoice).invoiceNumber
  
  if (preset.layoutType === 'modern' || preset.layoutType === 'minimal') {
    doc.text(docTitle, pageWidth / 2, yPos, { align: 'center' })
  } else {
    doc.text(docTitle, 20, yPos)
  }
  yPos += 10

  // Document details
  doc.setFontSize(preset.fontSize.body)
  doc.setTextColor(...hexToRgb(preset.colors.text))
  doc.setFont('helvetica', 'normal')
  
  const detailsX = preset.layoutType === 'bold' ? pageWidth - 70 : 20
  const detailsAlign = preset.layoutType === 'bold' ? 'right' : 'left'
  
  doc.text(`#${docNumber}`, detailsX, yPos, { align: detailsAlign as any })
  yPos += 6
  doc.text(`Date: ${new Date(document.createdAt).toLocaleDateString()}`, detailsX, yPos, { align: detailsAlign as any })
  yPos += 6
  
  if (type === 'quote' && (document as Quote).expiryDate) {
    doc.text(`Valid Until: ${new Date((document as Quote).expiryDate!).toLocaleDateString()}`, detailsX, yPos, { align: detailsAlign as any })
    yPos += 6
  }
  
  if (type === 'invoice' && (document as Invoice).dueDate) {
    doc.text(`Due Date: ${new Date((document as Invoice).dueDate!).toLocaleDateString()}`, detailsX, yPos, { align: detailsAlign as any })
    yPos += 6
  }

  yPos += 10

  // Business Info (if provided)
  if (preset.businessName || preset.businessAddress || preset.businessPhone || preset.businessEmail) {
    doc.setFontSize(preset.fontSize.heading)
    doc.setTextColor(...hexToRgb(preset.colors.secondary))
    doc.setFont('helvetica', 'bold')
    doc.text('FROM', 20, yPos)
    yPos += 6
    
    doc.setFontSize(preset.fontSize.body)
    doc.setTextColor(...hexToRgb(preset.colors.text))
    doc.setFont('helvetica', 'normal')
    
    if (preset.businessName) {
      doc.setFont('helvetica', 'bold')
      doc.text(preset.businessName, 20, yPos)
      doc.setFont('helvetica', 'normal')
      yPos += 5
    }
    if (preset.businessAddress) {
      const addressLines = doc.splitTextToSize(preset.businessAddress, 80)
      doc.text(addressLines, 20, yPos)
      yPos += addressLines.length * 5
    }
    if (preset.businessPhone) {
      doc.text(preset.businessPhone, 20, yPos)
      yPos += 5
    }
    if (preset.businessEmail) {
      doc.text(preset.businessEmail, 20, yPos)
      yPos += 5
    }
    yPos += 5
  }

  // Client Info
  doc.setFontSize(preset.fontSize.heading)
  doc.setTextColor(...hexToRgb(preset.colors.secondary))
  doc.setFont('helvetica', 'bold')
  doc.text('TO', 20, yPos)
  yPos += 6
  
  doc.setFontSize(preset.fontSize.body)
  doc.setTextColor(...hexToRgb(preset.colors.text))
  doc.setFont('helvetica', 'normal')
  
  const quote = document as Quote
  doc.setFont('helvetica', 'bold')
  doc.text(quote.clientName, 20, yPos)
  doc.setFont('helvetica', 'normal')
  yPos += 5
  
  if (quote.clientEmail) {
    doc.text(quote.clientEmail, 20, yPos)
    yPos += 5
  }
  if (quote.clientPhone) {
    doc.text(quote.clientPhone, 20, yPos)
    yPos += 5
  }
  
  yPos += 10

  // Line Items Table
  doc.setFontSize(preset.fontSize.heading)
  doc.setTextColor(...hexToRgb(preset.colors.secondary))
  doc.setFont('helvetica', 'bold')
  doc.text('ITEMS', 20, yPos)
  yPos += 7
  
  // Table Header
  doc.setFontSize(preset.fontSize.small)
  doc.setTextColor(...hexToRgb(preset.colors.textLight))
  doc.setFont('helvetica', 'bold')
  doc.text('Description', 20, yPos)
  doc.text('Qty', 120, yPos)
  doc.text('Price', 145, yPos)
  doc.text('Total', 190, yPos, { align: 'right' })
  yPos += 2
  
  // Line under header
  if (preset.showBorders) {
    doc.setDrawColor(...hexToRgb(preset.colors.border))
    doc.line(20, yPos, 190, yPos)
  }
  yPos += 5
  
  // Line Items
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...hexToRgb(preset.colors.text))
  doc.setFontSize(preset.fontSize.body)
  
  quote.lineItems.forEach((item) => {
    const lineTotal = item.quantity * item.unitPrice
    
    doc.text(item.description.substring(0, 50), 20, yPos)
    doc.text(item.quantity.toString(), 120, yPos)
    doc.text(`$${item.unitPrice.toFixed(2)}`, 145, yPos)
    doc.text(`$${lineTotal.toFixed(2)}`, 190, yPos, { align: 'right' })
    yPos += 6
    
    // Check if we need a new page
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
  })
  
  // Totals
  yPos += 5
  if (preset.showBorders) {
    doc.setDrawColor(...hexToRgb(preset.colors.border))
    doc.line(20, yPos, 190, yPos)
  }
  yPos += 7
  
  const subtotal = quote.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const tax = subtotal * quote.taxRate
  const total = subtotal + tax
  
  doc.setFontSize(preset.fontSize.body)
  doc.setTextColor(...hexToRgb(preset.colors.text))
  doc.text('Subtotal:', 145, yPos)
  doc.text(`$${subtotal.toFixed(2)}`, 190, yPos, { align: 'right' })
  yPos += 6
  
  doc.text(`Tax (${(quote.taxRate * 100).toFixed(1)}%):`, 145, yPos)
  doc.text(`$${tax.toFixed(2)}`, 190, yPos, { align: 'right' })
  yPos += 6
  
  // Total with accent color
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(preset.fontSize.heading)
  doc.setTextColor(...accentRgb)
  doc.text('TOTAL:', 145, yPos)
  doc.text(`$${total.toFixed(2)}`, 190, yPos, { align: 'right' })
  yPos += 10
  
  // Invoice-specific: Payment info
  if (type === 'invoice') {
    const inv = document as Invoice
    if (inv.amountPaid > 0) {
      doc.setFont('helvetica', 'normal')
      doc.setFontSize(preset.fontSize.body)
      doc.setTextColor(...hexToRgb(preset.colors.text))
      doc.text('Amount Paid:', 145, yPos)
      doc.text(`$${inv.amountPaid.toFixed(2)}`, 190, yPos, { align: 'right' })
      yPos += 6
      
      const balance = inv.amountDue - inv.amountPaid
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(...accentRgb)
      doc.text('Balance Due:', 145, yPos)
      doc.text(`$${balance.toFixed(2)}`, 190, yPos, { align: 'right' })
      yPos += 10
    }
  }
  
  // Notes
  if (quote.notes) {
    yPos += 5
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(preset.fontSize.heading)
    doc.setTextColor(...hexToRgb(preset.colors.secondary))
    doc.text('NOTES / TERMS:', 20, yPos)
    yPos += 6
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(preset.fontSize.small)
    doc.setTextColor(...hexToRgb(preset.colors.textLight))
    
    const lines = doc.splitTextToSize(quote.notes, 170)
    doc.text(lines, 20, yPos)
    yPos += lines.length * 5
  }
  
  // Footer text
  if (preset.footerText) {
    yPos += 10
    if (yPos > 250) {
      doc.addPage()
      yPos = 20
    }
    
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(preset.fontSize.small)
    doc.setTextColor(...hexToRgb(preset.colors.textLight))
    
    const footerLines = doc.splitTextToSize(preset.footerText, 170)
    doc.text(footerLines, 20, yPos)
    yPos += footerLines.length * 5
  }

  // Payment Information
  if (preset.paymentInfo &&
      (preset.paymentInfo.venmo || preset.paymentInfo.paypal || 
       preset.paymentInfo.cashApp || preset.paymentInfo.zelle ||
       preset.paymentInfo.bankDetails || preset.paymentInfo.qrCodeUrl)) {
    yPos += 10
    if (yPos > 240) {
      doc.addPage()
      yPos = 20
    }

    doc.setFont('helvetica', 'bold')
    doc.setFontSize(preset.fontSize.heading)
    doc.setTextColor(...hexToRgb(preset.colors.secondary))
    doc.text('PAYMENT METHODS', 20, yPos)
    yPos += 7

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(preset.fontSize.small)
    doc.setTextColor(...hexToRgb(preset.colors.text))

    // Payment methods in two columns
    const leftCol = 20
    const rightCol = 110
    let leftY = yPos
    let rightY = yPos

    if (preset.paymentInfo.venmo) {
      doc.setFont('helvetica', 'bold')
      doc.text('Venmo:', leftCol, leftY)
      doc.setFont('helvetica', 'normal')
      doc.text(preset.paymentInfo.venmo, leftCol + 20, leftY)
      leftY += 5
    }

    if (preset.paymentInfo.paypal) {
      doc.setFont('helvetica', 'bold')
      doc.text('PayPal:', rightCol, rightY)
      doc.setFont('helvetica', 'normal')
      doc.text(preset.paymentInfo.paypal, rightCol + 20, rightY)
      rightY += 5
    }

    if (preset.paymentInfo.cashApp) {
      doc.setFont('helvetica', 'bold')
      doc.text('Cash App:', leftCol, leftY)
      doc.setFont('helvetica', 'normal')
      doc.text(preset.paymentInfo.cashApp, leftCol + 22, leftY)
      leftY += 5
    }

    if (preset.paymentInfo.zelle) {
      doc.setFont('helvetica', 'bold')
      doc.text('Zelle:', rightCol, rightY)
      doc.setFont('helvetica', 'normal')
      doc.text(preset.paymentInfo.zelle, rightCol + 15, rightY)
      rightY += 5
    }

    yPos = Math.max(leftY, rightY)

    if (preset.paymentInfo.bankDetails) {
      yPos += 3
      doc.setFont('helvetica', 'bold')
      doc.text('Bank Details:', 20, yPos)
      yPos += 5
      doc.setFont('helvetica', 'normal')
      const bankLines = doc.splitTextToSize(preset.paymentInfo.bankDetails, 170)
      doc.text(bankLines, 20, yPos)
      yPos += bankLines.length * 5
    }

    // QR Code
    if (preset.paymentInfo.qrCodeUrl) {
      yPos += 5
      if (yPos > 220) {
        doc.addPage()
        yPos = 20
      }
      try {
        const qrSize = 30
        const qrX = pageWidth / 2 - qrSize / 2
        doc.addImage(preset.paymentInfo.qrCodeUrl, 'PNG', qrX, yPos, qrSize, qrSize)
        yPos += qrSize + 3
        doc.setFontSize(preset.fontSize.small - 1)
        doc.text('Scan to pay', pageWidth / 2, yPos, { align: 'center' })
      } catch (error) {
        console.error('Error adding QR code to PDF:', error)
      }
    }
  }
  
  // Save the PDF
  const filename = type === 'quote' 
    ? `quote-${(document as Quote).quoteNumber}.pdf`
    : `invoice-${(document as Invoice).invoiceNumber}.pdf`
  
  doc.save(filename)
}
