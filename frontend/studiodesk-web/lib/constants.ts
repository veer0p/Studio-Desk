export const STATUS_COLORS: Record<string, string> = {
    quote: 'bg-muted text-muted-foreground',
    booked: 'bg-primary/10 text-primary',
    partially_paid: 'bg-warning/10 text-warning',
    paid: 'bg-success/10 text-success',
    overdue: 'bg-danger/10 text-danger',
    completed: 'bg-sidebar/10 text-sidebar',
    cancelled: 'bg-danger/10 text-danger',
};

export const EVENT_TYPES = [
    { value: 'wedding', label: 'Wedding' },
    { value: 'pre_wedding', label: 'Pre-Wedding' },
    { value: 'engagement', label: 'Engagement' },
    { value: 'mehendi', label: 'Mehendi' },
    { value: 'sangeet', label: 'Sangeet' },
    { value: 'haldi', label: 'Haldi' },
    { value: 'portrait', label: 'Portrait' },
    { value: 'birthday', label: 'Birthday' },
    { value: 'corporate', label: 'Corporate' },
    { value: 'maternity', label: 'Maternity' },
    { value: 'newborn', label: 'Newborn' },
    { value: 'product', label: 'Product' },
    { value: 'other', label: 'Other' },
];

export const PIPELINE_STAGES = [
    'Inquiry',
    'Meeting Scheduled',
    'Quote Sent',
    'Confirmed',
    'Completed',
    'Lost',
];
