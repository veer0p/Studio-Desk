import type { InquiryFormInput } from '@/lib/validations/inquiry.schema';

export interface InquiryResult {
  lead_id: string;
  message: string;
}

/**
 * Public endpoint — no auth cookie. Uses raw fetch so the prefixUrl / credentials
 * config on the ky instance doesn't interfere with this unauthenticated route.
 */
export async function submitInquiry(
  studioSlug: string,
  data: InquiryFormInput,
): Promise<InquiryResult> {
  const base = (import.meta.env.VITE_API_BASE_URL as string) ?? '/api/v1';
  const url = `${base}/inquiry?studio=${encodeURIComponent(studioSlug)}`;

  // Strip empty optional strings before sending
  const payload = Object.fromEntries(
    Object.entries(data).filter(([, v]) => v !== '' && v !== undefined && v !== null),
  );

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  const body = (await res.json()) as
    | { data: InquiryResult }
    | { error: string; code: string };

  if (!res.ok) {
    const err = 'error' in body ? body.error : 'Submission failed';
    const code = 'code' in body ? body.code : 'UNKNOWN';
    const e = new Error(err) as Error & { code: string; status: number };
    e.code = code;
    e.status = res.status;
    throw e;
  }

  return (body as { data: InquiryResult }).data;
}
