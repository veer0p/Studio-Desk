const API_BASE = typeof window !== 'undefined' ? window.location.origin : ''

export interface Notification {
  id: string
  studio_id: string
  user_id: string
  type: string
  title: string
  body: string | null
  link: string | null
  entity_type: string | null
  entity_id: string | null
  is_read: boolean
  read_at: string | null
  created_at: string
}

export async function fetchNotifications(page = 0, pageSize = 20, isRead?: boolean): Promise<{
  notifications: Notification[]
  count: number
  page: number
  pageSize: number
  totalPages: number
}> {
  const qs = new URLSearchParams()
  qs.set('page', String(page))
  qs.set('pageSize', String(pageSize))
  if (isRead !== undefined) qs.set('is_read', String(isRead))

  const res = await fetch(`${API_BASE}/api/v1/notifications?${qs.toString()}`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch notifications' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }

  const json = await res.json()
  return {
    notifications: json.data || [],
    count: json.meta?.count || 0,
    page: json.meta?.page || 0,
    pageSize: json.meta?.pageSize || 20,
    totalPages: json.meta?.totalPages || 0,
  }
}

export async function fetchUnreadCount(): Promise<number> {
  const res = await fetch(`${API_BASE}/api/v1/notifications/unread-count`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) return 0
  const json = await res.json()
  return json.data?.count || 0
}

export async function markNotificationRead(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/notifications/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ is_read: true }),
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to mark as read' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
}

export async function markAllNotificationsRead() {
  const res = await fetch(`${API_BASE}/api/v1/notifications/read-all`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to mark all as read' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
}

export async function deleteNotification(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/notifications/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to delete' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
}
