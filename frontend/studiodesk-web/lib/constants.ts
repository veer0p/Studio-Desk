export const STATUS_COLORS = {
    // Booking pipeline
    new_lead: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    contacted: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300',
    proposal_sent: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    contract_signed: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300',
    advance_paid: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
    shoot_scheduled: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
    delivered: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300',
    closed: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    lost: 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400',
    // Invoice / payment
    draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
    sent: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
    partially_paid: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    paid: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    overdue: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
    cancelled: 'bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500',
    // Contract
    signed: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    // Gallery
    published: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    processing: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
} as const

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
]

export const PIPELINE_STAGES = [
    'Inquiry',
    'Meeting Scheduled',
    'Quote Sent',
    'Confirmed',
    'Completed',
    'Lost',
]

