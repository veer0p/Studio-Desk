import { GstType } from '@/types';

export const GST_RATES = {
  photography: 18,
  videography: 18,
  saas: 18,
} as const;

export const HSN_CODES = {
  photography: '998389',
  videography: '998392',
  editing: '998391',
  saas: '998313',
} as const;

/**
 * detectGstType
 * 
 * Determines if CGST/SGST or IGST applies based on state codes.
 */
export function detectGstType(studioStateCode: string, clientStateCode: string): GstType {
  if (!studioStateCode || !clientStateCode) return 'cgst_sgst';
  if (studioStateCode.toUpperCase() === clientStateCode.toUpperCase()) {
    return 'cgst_sgst';
  }
  return 'igst';
}

/**
 * calculateGst
 * 
 * Uses string arithmetic for precision.
 */
export function calculateGst(subtotal: number, gstType: GstType, rate: number = 18) {
  const amount = parseFloat(subtotal.toFixed(2));
  const totalGst = parseFloat(((amount * rate) / 100).toFixed(2));

  if (gstType === 'igst') {
    return {
      cgst: 0,
      sgst: 0,
      igst: totalGst,
      total: parseFloat((amount + totalGst).toFixed(2)),
      breakdown: { igst: totalGst },
    };
  }

  if (gstType === 'cgst_sgst') {
    const splitGst = parseFloat((totalGst / 2).toFixed(2));
    return {
      cgst: splitGst,
      sgst: splitGst,
      igst: 0,
      total: parseFloat((amount + splitGst * 2).toFixed(2)),
      breakdown: { cgst: splitGst, sgst: splitGst },
    };
  }

  return {
    cgst: 0,
    sgst: 0,
    igst: 0,
    total: amount,
    breakdown: {},
  };
}

export function calculateInvoiceTotals(lineItems: any[], gstType: GstType) {
  let subtotal = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;

  lineItems.forEach((item) => {
    const itemSubtotal = parseFloat((item.quantity * item.unit_price).toFixed(2));
    subtotal += itemSubtotal;
    
    const { cgst, sgst, igst } = calculateGst(itemSubtotal, gstType, item.gst_rate || 18);
    cgstTotal += cgst;
    sgstTotal += sgst;
    igstTotal += igst;
  });

  return {
    subtotal: parseFloat(subtotal.toFixed(2)),
    cgst: parseFloat(cgstTotal.toFixed(2)),
    sgst: parseFloat(sgstTotal.toFixed(2)),
    igst: parseFloat(igstTotal.toFixed(2)),
    grandTotal: parseFloat((subtotal + cgstTotal + sgstTotal + igstTotal).toFixed(2)),
  };
}

/**
 * getCurrentFinancialYear
 * 
 * Indian Financial Year: April to March
 */
export function getCurrentFinancialYear(): string {
  const now = new Date();
  const month = now.getMonth(); // 0-indexed
  const year = now.getFullYear();

  // If before April, we are in the previous year's FY
  const startYear = month < 3 ? year - 1 : year;
  const endYear = startYear + 1;

  return `FY${startYear.toString().slice(-2)}${endYear.toString().slice(-2)}`;
}

export function getFinancialYearRange() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const startYear = month < 3 ? year - 1 : year;
  
  return {
    start: new Date(startYear, 3, 1), // April 1st
    end: new Date(startYear + 1, 2, 31, 23, 59, 59), // March 31st
  };
}
