"use client"

import * as React from "react"
import useSWR from "swr"
import { Bell, CheckCheck, Trash2, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Notification,
  NOTIFICATION_TYPE_LABELS,
  NOTIFICATION_TYPE_COLORS,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadNotificationCount,
  deleteNotification,
} from "@/lib/api"

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" })
}

function NotificationItem({
  notification,
  onMarkRead,
  onDelete,
}: {
  notification: Notification
  onMarkRead: (id: string) => void
  onDelete: (id: string) => void
}) {
  const router = useRouter()
  const typeColor = NOTIFICATION_TYPE_COLORS[notification.type] || "text-muted-foreground"
  const typeLabel = NOTIFICATION_TYPE_LABELS[notification.type] || notification.type

  const handleClick = () => {
    if (!notification.is_read) {
      onMarkRead(notification.id)
    }
    if (notification.metadata?.booking_id) {
      router.push(`/bookings?id=${notification.metadata.booking_id}`)
    } else if (notification.metadata?.invoice_id) {
      router.push(`/finance/invoices?id=${notification.metadata.invoice_id}`)
    } else {
      router.push("/notifications")
    }
  }

  return (
    <DropdownMenuItem
      className={`flex flex-col items-start gap-1 px-3 py-2.5 cursor-pointer rounded-sm ${
        !notification.is_read
          ? "bg-primary/[0.04] dark:bg-primary/[0.06]"
          : ""
      }`}
      onClick={handleClick}
    >
      <div className="flex w-full items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {!notification.is_read && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
          )}
          <span className={`text-[10px] font-mono tracking-widest uppercase shrink-0 ${typeColor}`}>
            {typeLabel}
          </span>
        </div>
        <span className="text-[10px] text-muted-foreground shrink-0">
          {timeAgo(notification.created_at)}
        </span>
      </div>
      <p className={`text-sm leading-snug line-clamp-2 ${!notification.is_read ? "font-medium" : ""}`}>
        {notification.title}
      </p>
      {notification.message && (
        <p className="text-xs text-muted-foreground line-clamp-2">
          {notification.message}
        </p>
      )}
      <div className="flex items-center gap-1 mt-1" onClick={(e) => e.stopPropagation()}>
        {!notification.is_read && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-xs rounded-sm"
            onClick={() => onMarkRead(notification.id)}
          >
            <CheckCheck className="mr-1 h-3 w-3" />
            Mark read
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs rounded-sm text-muted-foreground hover:text-destructive"
          onClick={() => onDelete(notification.id)}
        >
          <Trash2 className="mr-1 h-3 w-3" />
          Delete
        </Button>
      </div>
    </DropdownMenuItem>
  )
}

export function NotificationBell() {
  const [open, setOpen] = React.useState(false)

  const { data: unreadCount, mutate: mutateUnread } = useSWR(
    "/api/v1/notifications/unread-count",
    () => getUnreadNotificationCount(),
    {
      refreshInterval: 30000,
      dedupingInterval: 10000,
      revalidateOnFocus: false,
    }
  )

  const { data: notifications, mutate: mutateNotifications } = useSWR(
    open ? "/api/v1/notifications?limit=10" : null,
    () => fetchNotifications({ limit: 10 }),
    {
      dedupingInterval: 5000,
      revalidateOnFocus: false,
    }
  )

  const handleMarkRead = React.useCallback(
    async (id: string) => {
      try {
        await markNotificationRead(id)
        mutateNotifications()
        mutateUnread()
      } catch {
        // Silently fail — user can retry
      }
    },
    [mutateNotifications, mutateUnread]
  )

  const handleMarkAllRead = React.useCallback(async () => {
    try {
      await markAllNotificationsRead()
      mutateNotifications()
      mutateUnread()
    } catch {
      // Silently fail
    }
  }, [mutateNotifications, mutateUnread])

  const handleDelete = React.useCallback(
    async (id: string) => {
      try {
        await deleteNotification(id)
        mutateNotifications()
        mutateUnread()
      } catch {
        // Silently fail
      }
    },
    [mutateNotifications, mutateUnread]
  )

  const notificationList = notifications?.notifications || []
  const hasUnread = (unreadCount || 0) > 0

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full relative">
          <Bell className="h-5 w-5" />
          {hasUnread && (
            <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-red-500 text-white text-[10px] font-mono tracking-widest px-1">
              {unreadCount || 0}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 max-h-[480px] overflow-y-auto rounded-md">
        <DropdownMenuLabel className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-[10px] font-mono tracking-widest uppercase rounded-sm"
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {notificationList.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
            <Bell className="h-8 w-8 text-muted-foreground/40 mb-2" />
            <p className="text-sm text-muted-foreground">No notifications</p>
            <p className="text-xs text-muted-foreground/70 mt-0.5">
              We&apos;ll notify you when something happens
            </p>
          </div>
        ) : (
          <div className="py-1">
            {notificationList.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onMarkRead={handleMarkRead}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {notificationList.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="justify-center cursor-pointer rounded-sm"
              onClick={() => {
                setOpen(false)
                window.location.href = "/notifications"
              }}
            >
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              <span className="text-xs font-mono tracking-widest uppercase">View all</span>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
