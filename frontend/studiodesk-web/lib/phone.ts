/**
 * Normalize a phone number for WhatsApp links.
 * Strips non-digit characters and ensures India country code (91) prefix.
 * Returns an empty string if the input has no usable digits.
 */
export function normalizeWhatsAppPhone(phone: string | null | undefined): string {
  if (!phone) return ""
  const digits = phone.replace(/\D/g, "")
  if (!digits) return ""
  if (digits.startsWith("91") && digits.length >= 10) return digits
  if (digits.startsWith("0")) return "91" + digits.slice(1)
  return "91" + digits
}

/**
 * Build a WhatsApp URL from a phone number.
 * Returns null if the phone number is invalid (no usable digits).
 */
export function whatsappUrl(phone: string | null | undefined): string | null {
  const normalized = normalizeWhatsAppPhone(phone)
  return normalized ? `https://wa.me/${normalized}` : null
}
