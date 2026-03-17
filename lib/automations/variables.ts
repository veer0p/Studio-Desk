import { format } from 'date-fns';
import { formatINR } from '../formatters';

interface VariableContext {
  client?: {
    full_name: string;
    email?: string;
    phone?: string;
  };
  studio?: {
    name: string;
    slug: string;
  };
  booking?: {
    event_date: string;
    event_type: string;
    venue?: string;
  };
  invoice?: {
    invoice_number: string;
    total_amount: number;
    amount_pending: number;
    due_date?: string;
    payment_link?: string;
  };
  gallery?: {
    slug: string;
    url: string;
  };
  team?: {
    name: string;
    role: string;
    invitation_link?: string;
  };
}

/**
 * Replaces dynamic variables in a template string with actual values from context.
 * Example: "Hello {{client_name}}" -> "Hello John Doe"
 */
export function replaceVariables(template: string, context: VariableContext): string {
  const vars: Record<string, string> = {
    // Client
    client_name: context.client?.full_name || 'Client',
    client_email: context.client?.email || '',
    client_phone: context.client?.phone || '',

    // Studio
    studio_name: context.studio?.name || 'StudioDesk',
    studio_slug: context.studio?.slug || '',

    // Booking
    booking_date: context.booking?.event_date 
      ? format(new Date(context.booking.event_date), 'PPP') 
      : '',
    event_type: context.booking?.event_type || '',
    venue: context.booking?.venue || '',

    // Invoice
    invoice_number: context.invoice?.invoice_number || '',
    total_amount: context.invoice?.total_amount 
      ? formatINR(context.invoice.total_amount) 
      : '',
    amount_pending: context.invoice?.amount_pending 
      ? formatINR(context.invoice.amount_pending) 
      : '',
    due_date: context.invoice?.due_date 
      ? format(new Date(context.invoice.due_date), 'PPP') 
      : '',
    payment_link: context.invoice?.payment_link || '',

    // Gallery
    gallery_url: context.gallery?.url || '',
    gallery_slug: context.gallery?.slug || '',

    // Team
    member_name: context.team?.name || '',
    member_role: context.team?.role || '',
    invitation_link: context.team?.invitation_link || '',

    // Common
    current_year: new Date().getFullYear().toString(),
  };

  return template.replace(/\{\{([^{}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    return vars[trimmedKey] !== undefined ? vars[trimmedKey] : match;
  });
}
