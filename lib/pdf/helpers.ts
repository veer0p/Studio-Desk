/**
 * amountInWords
 * 
 * Converts a number to its Indian English representation (Lakhs/Crores).
 */
export function amountInWords(amount: number): string {
  const roundedAmount = Math.floor(amount);
  if (roundedAmount === 0) return 'Rupees Zero Only';

  const singleDigits = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teenDigits = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const doubleDigits = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertSection(num: number): string {
    let str = '';
    if (num >= 100) {
      str += singleDigits[Math.floor(num / 100)] + ' Hundred ';
      num %= 100;
    }
    if (num >= 20) {
      str += doubleDigits[Math.floor(num / 10)] + ' ';
      num %= 10;
    } else if (num >= 10) {
      str += teenDigits[num - 10] + ' ';
      num = 0;
    }
    if (num > 0) {
      str += singleDigits[num] + ' ';
    }
    return str;
  }

  let words = '';
  let remaining = roundedAmount;

  // Crores
  if (remaining >= 10000000) {
    words += convertSection(Math.floor(remaining / 10000000)) + 'Crore ';
    remaining %= 10000000;
  }
  // Lakhs
  if (remaining >= 100000) {
    words += convertSection(Math.floor(remaining / 100000)) + 'Lakh ';
    remaining %= 100000;
  }
  // Thousands
  if (remaining >= 1000) {
    words += convertSection(Math.floor(remaining / 1000)) + 'Thousand ';
    remaining %= 1000;
  }
  // Hundreds and tens
  words += convertSection(remaining);

  return `Rupees ${words.trim()} Only`;
}

/**
 * formatGSTIN
 * 
 * Formats GSTIN for clear display (e.g., 27AAAAA0000A1Z5)
 */
export function formatGSTIN(gstin: string): string {
  if (!gstin) return 'N/A';
  return gstin.toUpperCase();
}

/**
 * Brand colors and layout constants for PDF
 */
export const getPDFStyles = () => ({
  colors: {
    primary: '#0F172A', // Slate 900
    secondary: '#64748B', // Slate 500
    accent: '#3B82F6', // Blue 500
    success: '#10B981', // Emerald 500
    danger: '#EF4444', // Red 500
    light: '#F8FAFC', // Slate 50
    border: '#E2E8F0', // Slate 200
  },
  spacing: {
    padding: 24,
    marginSmall: 8,
    marginMedium: 16,
    marginLarge: 32,
  },
  fontSize: {
    xs: 8,
    sm: 10,
    base: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  }
});
