import { GstType } from '@/types'

export const GST_RATE = 18
export const HSN_CODES = {
  photography: '998389',
  videography: '998392',
  editing: '998391',
  saas: '998313',
}

export function detectGstType(studioStateCode: string, clientStateCode: string | null): GstType {
  if (!clientStateCode || studioStateCode === clientStateCode) {
    return 'cgst_sgst'
  }
  return 'igst'
}

export function calculateGst(subtotal: number, gstType: GstType, rate = GST_RATE) {
  if (subtotal === 0) return { cgst: 0, sgst: 0, igst: 0, total: 0 }

  if (gstType === 'cgst_sgst') {
    const totalGst = parseFloat((subtotal * rate / 100).toFixed(2))
    const half = parseFloat((totalGst / 2).toFixed(2))
    // Adjust for rounding: make sure half + half = totalGst or close enough
    // In practice, it's safer to calculate each half from subtotal
    const cgst = parseFloat((subtotal * (rate / 2) / 100).toFixed(2))
    const sgst = cgst
    return { cgst, sgst, igst: 0, total: parseFloat((cgst + sgst).toFixed(2)) }
  }

  if (gstType === 'igst') {
    const igst = parseFloat((subtotal * rate / 100).toFixed(2))
    return { cgst: 0, sgst: 0, igst, total: igst }
  }

  return { cgst: 0, sgst: 0, igst: 0, total: 0 }
}

export interface LineItem {
  quantity: number
  unit_price: number
}

export function calculateInvoiceTotals(lineItems: LineItem[], gstType: GstType) {
  const subtotal = lineItems.reduce((acc, item) => {
    return acc + parseFloat((item.quantity * item.unit_price).toFixed(2))
  }, 0)

  const gst = calculateGst(subtotal, gstType)

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    cgst: gst.cgst,
    sgst: gst.sgst,
    igst: gst.igst,
    gstTotal: gst.total,
    grandTotal: parseFloat((subtotal + gst.total).toFixed(2)),
  }
}

export function getCurrentFinancialYear(): string {
  const today = new Date()
  const month = today.getMonth() // 0-indexed, 0 = Jan
  const year = today.getFullYear()
  
  // April=3, so if month < 3, we are in the FY starting last year
  const startYear = month < 3 ? year - 1 : year
  const endYear = startYear + 1
  
  return `FY${startYear.toString().slice(-2)}${endYear.toString().slice(-2)}`
}

export function getFinancialYearRange(): { start: Date; end: Date } {
  const today = new Date()
  const month = today.getMonth()
  const year = today.getFullYear()
  const startYear = month < 3 ? year - 1 : year
  
  return {
    start: new Date(startYear, 3, 1), // April 1st
    end: new Date(startYear + 1, 2, 31, 23, 59, 59), // March 31st
  }
}
