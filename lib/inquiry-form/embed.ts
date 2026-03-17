import { createQRDataUrl } from "@/lib/qr/generator";

/**
 * Utilities for the inquiry form embed feature.
 */

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://studiodesk.in";

/**
 * Generates clean iframe HTML for embedding the inquiry form.
 */
export function generateEmbedCode(slug: string, options: { height?: string; width?: string; border?: boolean } = {}) {
  const { height = "700px", width = "100%", border = false } = options;
  const url = `${APP_URL}/inquiry/${slug}`;
  
  return `<iframe 
  src="${url}" 
  width="${width}" 
  height="${height}" 
  style="border: ${border ? '1px solid #eee' : 'none'}; border-radius: 8px;"
  title="Inquiry Form"
></iframe>`;
}

/**
 * Generates the public share link for the studio's inquiry form.
 */
export function generateShareLink(slug: string) {
  return `${APP_URL}/inquiry/${slug}`;
}

/**
 * Generates a QR code data URL for the studio's inquiry form.
 */
export async function generateInquiryQR(slug: string) {
  const url = generateShareLink(slug);
  return createQRDataUrl(url);
}
