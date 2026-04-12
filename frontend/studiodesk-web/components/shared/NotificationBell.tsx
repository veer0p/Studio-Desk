'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import Link from 'next/link'
import { fetchNotifications, fetchUnreadCount, markNotificationRead, markAllNotificationsRead, Notification } from '@/lib/notifications-api'

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`
  return `${Math.floor(seconds / 86400)}d`
}

const TYPE_ICONS: Record<string, string> = {
  info: 'ℹ️',
  success: '✅',
  warning: '⚠️',
  error: '❌',
  billing: '💳',
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)

  const { data: unreadCount } = useSWR('/notifications/unread-count', fetchUnreadCount, {
    refreshInterval: 30000,
    revalidateOnFocus: false,
  })

  const { data } = useSWR(
    open ? '/notifications?recent' : null,
    () => fetchNotifications(0, 5),
    { revalidateOnFocus: false, revalidateIfStale: true }
  )

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    mutate('/notifications')
    mutate('/notifications/unread-count')
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    mutate('/notifications')
    mutate('/notifications/unread-count')
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative w-9 h-9 rounded-md flex items-center justify-center text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
        aria-label="Notifications"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
        </svg>
        {unreadCount !== undefined && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-blue-500 text-[10px] text-white flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />

          {/* Dropdown */}
          <div className="absolute right-0 top-12 w-80 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-zinc-800 rounded-lg shadow-xl z-50 overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
              <h3 className="text-sm font-medium text-zinc-200">Notifications</h3>
              {unreadCount !== undefined && unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-72 overflow-y-auto">
              {!data?.notifications || data.notifications.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">No notifications</p>
              ) : (
                data.notifications.map((n: Notification) => (
                  <div
                    key={n.id}
                    className={`px-4 py-3 border-b border-zinc-800/50 last:border-0 ${
                      n.is_read ? 'opacity-60' : ''
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-xs mt-0.5">{TYPE_ICONS[n.type] || 'ℹ️'}</span>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${n.is_read ? 'text-zinc-500' : 'text-zinc-200'}`}>
                          {n.title}
                        </p>
                        <p className="text-[10px] text-zinc-600 mt-0.5">{timeAgo(n.created_at)}</p>
                      </div>
                      {!n.is_read && (
                        <button
                          onClick={() => handleMarkRead(n.id)}
                          className="text-xs text-zinc-600 hover:text-zinc-400"
                        >
                          ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-zinc-800 px-4 py-2.5">
              <Link
                href="/notifications"
                onClick={() => setOpen(false)}
                className="text-xs text-blue-400 hover:text-blue-300"
              >
                View all notifications →
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
