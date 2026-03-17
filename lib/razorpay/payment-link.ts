import { razorpay, rupeesToPaise } from './client';
import { env } from '@/lib/env';

/**
 * createInvoicePaymentLink
 * 
 * Creates a Razorpay payment link for a specific invoice.
 */
export async function createInvoicePaymentLink(params: {
  amount_rupees: number;
  invoice_number: string;
  due_date?: string;
  customer: {
    name: string;
    email: string;
    contact: string;
  };
  description?: string;
}) {
  const { amount_rupees, invoice_number, due_date, customer, description } = params;

  // Expiry is due_date + 1 day, or 7 days from now
  const expiryTimestamp = due_date 
    ? Math.floor(new Date(due_date).getTime() / 1000) + 86400 
    : Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60);

  return await razorpay.paymentLink.create({
    amount: rupeesToPaise(amount_rupees),
    currency: 'INR',
    accept_partial: false,
    description: description || `Payment for Invoice ${invoice_number}`,
    customer: {
      name: customer.name,
      email: customer.email,
      contact: customer.contact,
    },
    notify: {
      sms: true,
      email: true,
    },
    reminder_enable: true,
    expire_by: expiryTimestamp,
    reference_id: invoice_number,
    callback_url: `${env.NEXT_PUBLIC_APP_URL}/api/webhooks/razorpay/callback`,
    callback_method: 'get',
  });
}

/**
 * expirePaymentLink
 * 
 * Manually cancels a payment link.
 */
export async function expirePaymentLink(linkId: string) {
  return await razorpay.paymentLink.cancel(linkId);
}

/**
 * getPaymentLinkStatus
 * 
 * Fetches the current status of a payment link from Razorpay.
 */
export async function getPaymentLinkStatus(linkId: string) {
  return await razorpay.paymentLink.fetch(linkId);
}
