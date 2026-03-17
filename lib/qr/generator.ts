import QRCode from 'qrcode';
import { createAdminClient } from '../supabase/admin';

/**
 * Generate QR codes for face clusters and event galleries
 */
export async function generateQRCode(url: string, options: any = {}): Promise<string> {
  const { size = 300, errorCorrectionLevel = 'M' } = options;
  return QRCode.toDataURL(url, {
    width: size,
    errorCorrectionLevel,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#ffffff'
    }
  });
}

/**
 * Upload QR PNG to Supabase Storage
 */
export async function uploadQRToStorage(qrDataUrl: string, path: string): Promise<string> {
  const supabase = createAdminClient();
  
  // Convert base64 DataURL to Buffer
  const base64Data = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  const buffer = Buffer.from(base64Data, 'base64');

  const { error } = await supabase.storage
    .from('studio-assets')
    .upload(path, buffer, {
      contentType: 'image/png',
      upsert: true
    });

  if (error) throw error;

  const { data: { publicUrl } } = supabase.storage
    .from('studio-assets')
    .getPublicUrl(path);

  return publicUrl;
}
