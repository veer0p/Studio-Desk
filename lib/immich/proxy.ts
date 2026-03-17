import { createHmac } from 'crypto';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default_secret';

/**
 * Proxy Immich asset URLs through StudioDesk API
 */

export function signAssetToken(assetId: string, studioId: string, expiresInMs: number = 4 * 60 * 60 * 1000): string {
  const expiresAt = Date.now() + expiresInMs;
  const data = `${assetId}:${studioId}:${expiresAt}`;
  const hmac = createHmac('sha256', ENCRYPTION_KEY).update(data).digest('hex');
  
  // Return base64 encoded payload: expiry.hmac
  return Buffer.from(`${expiresAt}.${hmac}`).toString('base64');
}

export function verifyAssetToken(token: string, assetId: string, studioId: string): boolean {
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const [expiresAtStr, signature] = decoded.split('.');
    const expiresAt = parseInt(expiresAtStr);

    if (Date.now() > expiresAt) return false;

    const data = `${assetId}:${studioId}:${expiresAt}`;
    const expectedHmac = createHmac('sha256', ENCRYPTION_KEY).update(data).digest('hex');

    return signature === expectedHmac;
  } catch {
    return false;
  }
}

export function getSignedThumbnailUrl(assetId: string, studioId: string): string {
  const token = signAssetToken(assetId, studioId);
  return `/api/immich/asset/${assetId}/thumbnail?token=${encodeURIComponent(token)}&studioId=${encodeURIComponent(studioId)}`;
}

export function getSignedDownloadUrl(assetId: string, studioId: string): string {
  const token = signAssetToken(assetId, studioId);
  return `/api/immich/asset/${assetId}/download?token=${encodeURIComponent(token)}&studioId=${encodeURIComponent(studioId)}`;
}
