import { cn } from "@/lib/utils"

export type BookingStatus =
    | 'new_lead' | 'contacted' | 'proposal_sent' | 'contract_signed'
    | 'advance_paid' | 'shoot_scheduled' | 'delivered' | 'closed' | 'lost'

export type InvoiceStatus = 'draft' | 'sent' | 'partially_paid' | 'paid' | 'overdue' | 'cancelled'
export type ContractStatus = 'signed' | 'awaiting_signature'
export type GalleryStatus = 'published' | 'processing' | 'not_uploaded'

export type EventType = 'wedding' | 'corporate' | 'birthday' | 'portrait' | 'pre_wedding' | 'other'

const STATUS_COLORS: Record<string, { label: string, classes: string }> = {
    // Booking pipeline
    new_lead: { label: 'New Lead', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    contacted: { label: 'Contacted', classes: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300' },
    proposal_sent: { label: 'Proposal Sent', classes: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' },
    contract_signed: { label: 'Contract Signed', classes: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' },
    advance_paid: { label: 'Advance Paid', classes: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300' },
    shoot_scheduled: { label: 'Scheduled', classes: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' },
    delivered: { label: 'Delivered', classes: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300' },
    closed: { label: 'Closed', classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    lost: { label: 'Lost', classes: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' },

    // Invoice
    draft: { label: 'Draft', classes: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' },
    sent: { label: 'Sent', classes: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
    partially_paid: { label: 'Partially Paid', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    paid: { label: 'Paid', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    overdue: { label: 'Overdue', classes: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
    cancelled: { label: 'Cancelled', classes: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },

    // Contract
    signed: { label: 'Signed', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    awaiting_signature: { label: 'Awaiting Signature', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },

    // Gallery
    published: { label: 'Published', classes: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    processing: { label: 'Processing', classes: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    not_uploaded: { label: 'Not Uploaded', classes: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500' },
}

const EVENT_COLORS: Record<string, { label: string, classes: string }> = {
    wedding: { label: 'Wedding', classes: 'bg-[#EDE9FE] text-[#7C3AED] dark:bg-[#7C3AED]/20 dark:text-[#A78BFA]' },
    corporate: { label: 'Corporate', classes: 'bg-[#DBEAFE] text-[#1D4ED8] dark:bg-[#1D4ED8]/20 dark:text-[#93C5FD]' },
    birthday: { label: 'Birthday', classes: 'bg-[#FCE7F3] text-[#BE185D] dark:bg-[#BE185D]/20 dark:text-[#F9A8D4]' },
    portrait: { label: 'Portrait', classes: 'bg-[#FEF9C3] text-[#D97706] dark:bg-[#D97706]/20 dark:text-[#FDE047]' },
    pre_wedding: { label: 'Pre-Wedding', classes: 'bg-[#FFE4E6] text-[#BE123C] dark:bg-[#BE123C]/20 dark:text-[#FDA4AF]' },
    other: { label: 'Other', classes: 'bg-[#F3F4F6] text-[#6B7280] dark:bg-[#6B7280]/20 dark:text-[#9CA3AF]' },
}

interface StatusBadgeProps {
    status: BookingStatus | InvoiceStatus | ContractStatus | GalleryStatus | string
    className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
    const config = STATUS_COLORS[status] || STATUS_COLORS.draft
    return (
        <span className={cn("inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full", config.classes, className)}>
            {config.label}
        </span>
    )
}

interface EventBadgeProps {
    type: EventType | string
    className?: string
}

export function EventBadge({ type, className }: EventBadgeProps) {
    const config = EVENT_COLORS[type] || EVENT_COLORS.other
    return (
        <span className={cn("inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full", config.classes, className)}>
            {config.label}
        </span>
    )
}
