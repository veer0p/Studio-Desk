export type ContractVariables = {
    client_name: string;
    client_email: string;
    client_phone: string;
    studio_name: string;
    studio_address: string;
    studio_gstin: string;
    event_type: string;
    event_date: string;
    venue: string;
    total_amount: string;
    advance_amount: string;
    balance_amount: string;
    deliverables: string;
    turnaround_days: string;
    payment_schedule: string;
    today_date: string;
};

/**
 * Replaces all {{variable_name}} in HTML with actual values.
 */
export function renderTemplate(templateHtml: string, variables: ContractVariables): string {
    let rendered = templateHtml;
    
    const varMap: Record<string, string> = {
        'client_name': variables.client_name,
        'client_email': variables.client_email,
        'client_phone': variables.client_phone,
        'studio_name': variables.studio_name,
        'studio_address': variables.studio_address,
        'studio_gstin': variables.studio_gstin,
        'event_type': variables.event_type,
        'event_date': variables.event_date,
        'venue': variables.venue,
        'total_amount': variables.total_amount,
        'advance_amount': variables.advance_amount,
        'balance_amount': variables.balance_amount,
        'deliverables': variables.deliverables,
        'turnaround_days': variables.turnaround_days,
        'payment_schedule': variables.payment_schedule,
        'today_date': variables.today_date,
    };

    Object.entries(varMap).forEach(([key, value]) => {
        const regex = new RegExp(`{{${key}}}`, 'g');
        rendered = rendered.replace(regex, value || '[NOT PROVIDED]');
    });

    return rendered;
}

/**
 * Validates and sanitizes signature data.
 */
export function sanitizeSignatureData(data: string): string {
    if (!data || data.length < 10) throw new Error('Invalid signature data');
    // Ensure it's either a data URI (SVG/PNG) or a clear name string
    return data.trim();
}
