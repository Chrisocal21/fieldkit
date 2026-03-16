import { Quote } from '@/store/quoteStore'
import jsPDF from 'jspdf'

export function generateQuotePDF(quote: Quote) {
  const doc = new jsPDF()
  
  // Header
  doc.setFontSize(24)
  doc.text('QUOTE', 20, 20)
  
  doc.setFontSize(10)
  doc.text(`Quote #${quote.quoteNumber}`, 20, 30)
  doc.text(`Date: ${new Date(quote.createdAt).toLocaleDateString()}`, 20, 36)
  
  if (quote.expiryDate) {
    doc.text(`Valid Until: ${new Date(quote.expiryDate).toLocaleDateString()}`, 20, 42)
  }
  
  // Client Info
  doc.setFontSize(12)
  doc.text('CLIENT', 20, 55)
  doc.setFontSize(10)
  doc.text(quote.clientName, 20, 62)
  if (quote.clientEmail) {
    doc.text(quote.clientEmail, 20, 68)
  }
  if (quote.clientPhone) {
    doc.text(quote.clientPhone, 20, quote.clientEmail ? 74 : 68)
  }
  
  // Line Items Table
  let yPos = 90
  doc.setFontSize(12)
  doc.text('ITEMS', 20, yPos)
  yPos += 7
  
  // Table Header
  doc.setFontSize(9)
  doc.setFont(undefined, 'bold')
  doc.text('Description', 20, yPos)
  doc.text('Qty', 120, yPos)
  doc.text('Price', 145, yPos)
  doc.text('Total', 170, yPos, { align: 'right' })
  yPos += 2
  
  // Line under header
  doc.line(20, yPos, 190, yPos)
  yPos += 5
  
  // Line Items
  doc.setFont(undefined, 'normal')
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
  doc.line(20, yPos, 190, yPos)
  yPos += 7
  
  const subtotal = quote.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  )
  const tax = subtotal * quote.taxRate
  const total = subtotal + tax
  
  doc.text('Subtotal:', 145, yPos)
  doc.text(`$${subtotal.toFixed(2)}`, 190, yPos, { align: 'right' })
  yPos += 6
  
  doc.text(`Tax (${(quote.taxRate * 100).toFixed(1)}%):`, 145, yPos)
  doc.text(`$${tax.toFixed(2)}`, 190, yPos, { align: 'right' })
  yPos += 6
  
  doc.setFont(undefined, 'bold')
  doc.setFontSize(11)
  doc.text('TOTAL:', 145, yPos)
  doc.text(`$${total.toFixed(2)}`, 190, yPos, { align: 'right' })
  
  // Notes
  if (quote.notes) {
    yPos += 15
    doc.setFont(undefined, 'normal')
    doc.setFontSize(10)
    doc.text('NOTES / TERMS:', 20, yPos)
    yPos += 6
    doc.setFontSize(9)
    
    // Split notes into lines
    const lines = doc.splitTextToSize(quote.notes, 170)
    doc.text(lines, 20, yPos)
  }
  
  // Save the PDF
  doc.save(`quote-${quote.quoteNumber}.pdf`)
}
