'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  Notification,
} from '@/lib/notifications-api'

const TYPE_ICONS: Record<string, { icon: string; color: string }> = {
  info: { icon: 'ℹ️', color: 'text-blue-400' },
  success: { icon: '✅', color: 'text-green-400' },
  warning: { icon: '⚠️', color: 'text-amber-400' },
  error: { icon: '❌', color: 'text-red-400' },
  billing: { icon: '💳', color: 'text-purple-400' },
}

function timeAgo(date: string): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`
  return new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })
}

export default function NotificationsPage() {
  const [page, setPage] = useState(0)
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('unread')

  const isReadFilter = filter === 'all' ? undefined : filter === 'read' ? true : false

  const { data, isLoading } = useSWR(
    [`/notifications`, page, filter],
    () => fetchNotifications(page, 30, isReadFilter),
    { revalidateOnFocus: false, revalidateOnReconnect: true }
  )

  const { data: unreadCount } = useSWR('/notifications/unread-count', fetchUnreadCount, {
    refreshInterval: 30000,
    revalidateOnFocus: false,
  })

  const handleMarkRead = async (id: string) => {
    await markNotificationRead(id)
    mutate(`/notifications`)
  }

  const handleMarkAllRead = async () => {
    await markAllNotificationsRead()
    mutate(`/notifications`)
  }

  const handleDelete = async (id: string) => {
    await deleteNotification(id)
    mutate(`/notifications`)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Notifications</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {unreadCount !== undefined && unreadCount > 0
              ? `${unreadCount} unread`
              : 'All caught up'}
          </p>
        </div>
        {unreadCount !== undefined && unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-3 py-2 text-sm rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* Filter */}
      <div className="flex gap-2">
        {(['all', 'unread', 'read'] as const).map((f) => (
          <button
            key={f}
            onClick={() => { setFilter(f); setPage(0) }}
            className={`text-xs px-3 py-1.5 rounded-md border transition-colors capitalize ${
              filter === f
                ? 'bg-zinc-700 text-zinc-100 border-zinc-600'
                : 'bg-zinc-800/50 text-zinc-500 border-zinc-700 hover:text-zinc-300'
            }`}
          >
            {f}
            {f === 'unread' && unreadCount !== undefined && unreadCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px]">
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-zinc-800/50">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3 animate-pulse">
                <div className="w-5 h-5 bg-zinc-800 rounded mt-0.5" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-48 bg-zinc-800 rounded" />
                  <div className="h-3 w-full bg-zinc-900 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : data?.notifications.length === 0 ? (
          <div className="py-12 text-center">
            <svg className="w-10 h-10 mx-auto text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
            <p className="text-sm text-zinc-500">No notifications</p>
            <p className="text-xs text-zinc-600 mt-1">You'll see notifications here when they arrive</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-800/50">
            {data?.notifications.map((n: Notification) => {
              const typeInfo = TYPE_ICONS[n.type] || TYPE_ICONS.info
              return (
                <div
                  key={n.id}
                  className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                    n.is_read ? 'opacity-60' : 'bg-zinc-900/30'
                  }`}
                >
                  <span className={`mt-0.5 text-sm ${typeInfo.color}`}>{typeInfo.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className={`text-sm font-medium truncate ${n.is_read ? 'text-zinc-400' : 'text-zinc-100'}`}>
                        {n.title}
                      </p>
                      {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                    </div>
                    {n.body && (
                      <p className="text-xs text-zinc-500 mt-0.5 line-clamp-2">{n.body}</p>
                    )}
                    <p className="text-[10px] text-zinc-600 mt-0.5">{timeAgo(n.created_at)}</p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {!n.is_read && (
                      <button
                        onClick={() => handleMarkRead(n.id)}
                        className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
                        title="Mark as read"
                      >
                        ✓
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(n.id)}
                      className="text-xs px-2 py-1 rounded text-zinc-600 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                      title="Delete"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>Page {page + 1} of {data.totalPages} ({data.count} notifications)</span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-md border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-300"
            >
              Previous
            </button>
            <button
              disabled={page >= data.totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-md border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
