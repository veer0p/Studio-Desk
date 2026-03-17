import Razorpay from 'razorpay';
import crypto from 'crypto';
import { env } from '@/lib/env';

/**
 * Razorpay Client
 */
export const razorpay = new Razorpay({
  key_id: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

/**
 * RAZORPAY HELPERS
 * NOTE: Razorpay expects amounts in PAISE (rupees * 100)
 */

export const rupeesToPaise = (rupees: number): number => Math.round(rupees * 100);

export const paiseToRupees = (paise: number): number => paise / 100;

export async function createPaymentLink(params: {
  amount_rupees: number;
  currency: string;
  description: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  notify?: {
    sms: boolean;
    email: boolean;
  };
  expire_by?: number;
  reference_id?: string;
  callback_url?: string;
}) {
  return await razorpay.paymentLink.create({
    amount: rupeesToPaise(params.amount_rupees),
    currency: params.currency || 'INR',
    accept_partial: false,
    description: params.description,
    customer: params.customer,
    notify: params.notify || { sms: true, email: true },
    reminder_enable: true,
    expire_by: params.expire_by,
    reference_id: params.reference_id,
    callback_url: params.callback_url || `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/razorpay/callback`,
    callback_method: 'get',
  });
}

export function verifyWebhookSignature(body: string, signature: string): boolean {
  const expectedSignature = crypto
    .createHmac('sha256', env.RAZORPAY_WEBHOOK_SECRET)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

export async function createOrder(params: {
  amount_rupees: number;
  currency?: string;
  receipt: string;
  notes?: Record<string, string>;
}) {
  return await razorpay.orders.create({
    amount: rupeesToPaise(params.amount_rupees),
    currency: params.currency || 'INR',
    receipt: params.receipt,
    notes: params.notes,
  });
}
