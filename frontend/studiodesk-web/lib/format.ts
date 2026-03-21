export function formatINR(amount: number | string): string {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 2,
    }).format(numericAmount);
}

export function formatINRCompact(amount: number): string {
    if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
    if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
    return `₹${amount}`;
}

export function formatDate(date: string | Date): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata',
    }).format(d);
}

export function formatDateRelative(date: string | Date): string {
    const target = new Date(date).setHours(0, 0, 0, 0);
    const now = new Date().setHours(0, 0, 0, 0);
    const diffDays = Math.round((target - now) / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === -1) return 'Yesterday';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays > 0) return `In ${diffDays} days`;
    return `${Math.abs(diffDays)} days ago`;
}

export function formatDateTime(date: string | Date): string {
    const d = new Date(date);
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        timeZone: 'Asia/Kolkata',
    }).format(d);
}

export function isOverdue(dueDate: string | Date): boolean {
    const due = new Date(dueDate).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return due < today;
}

export function isPastDate(date: string | Date): boolean {
    return new Date(date).getTime() < new Date().getTime();
}

export function daysUntil(date: string | Date): number {
    const target = new Date(date).setHours(0, 0, 0, 0);
    const now = new Date().setHours(0, 0, 0, 0);
    return Math.round((target - now) / (1000 * 60 * 60 * 24));
}
