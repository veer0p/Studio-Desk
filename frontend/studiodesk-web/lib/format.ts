/**
 * Indian Formatting Rules (mandatory everywhere)
 * Based on StudioDesk Frontend Rules Section 7
 */

// ✅ INR full format: ₹2,40,000.00
export function formatINR(amount: number | string): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(numericAmount)
}

// ✅ INR compact: ₹2.4L, ₹50K
export function formatINRCompact(amount: number): string {
    if (amount >= 10000000) return `₹${(amount / 10000000).toFixed(2)}Cr`
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
    return `₹${amount}`
}

// ✅ Dates (ALWAYS DD MMM YYYY, IST timezone)
export function formatDate(date: string | Date): string {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    }).format(d)
}

// ✅ Relative dates: 'In 5 days', 'Today', '5 days ago'
export function formatDateRelative(date: string | Date): string {
    if (!date) return '-'
    const target = new Date(date).setHours(0, 0, 0, 0)
    const now = new Date().setHours(0, 0, 0, 0)
    const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === -1) return 'Yesterday'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays > 0) return `In ${diffDays} days`
    return `${Math.abs(diffDays)} days ago`
}

// ✅ Date Time: 15 Nov 2025, 2:30 PM
export function formatDateTime(date: string | Date): string {
    if (!date) return '-'
    const d = typeof date === 'string' ? new Date(date) : date
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
    }).format(d)
}

// ✅ Check if date is overdue (before today)
export function isOverdue(dueDate: string | Date): boolean {
    if (!dueDate) return false
    const due = new Date(dueDate).setHours(0, 0, 0, 0)
    const today = new Date().setHours(0, 0, 0, 0)
    return due < today
}

// ✅ Check if date is in the past (before now)
export function isPastDate(date: string | Date): boolean {
    if (!date) return false
    return new Date(date).getTime() < new Date().getTime()
}

// ✅ Days until target date
export function daysUntil(date: string | Date): number {
    if (!date) return 0
    const target = new Date(date).setHours(0, 0, 0, 0)
    const now = new Date().setHours(0, 0, 0, 0)
    return Math.round((target - now) / (1000 * 60 * 60 * 24))
}
