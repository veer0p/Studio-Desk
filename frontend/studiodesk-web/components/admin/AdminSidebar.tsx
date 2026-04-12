'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAdminAuth } from '@/hooks/use-admin-auth'

const NAV_ITEMS = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: '📊' },
  { href: '/admin/studios', label: 'Studios', icon: '🏢' },
  { href: '/admin/plans', label: 'Plans', icon: '💳' },
  { href: '/admin/audit-logs', label: 'Audit Logs', icon: '📋' },
  { href: '/admin/feature-flags', label: 'Flags', icon: '🚩' },
  { href: '/admin/settings', label: 'Settings', icon: '⚙️' },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { admin, logout, isSuperAdmin } = useAdminAuth()

  const isImpersonating = false // Will be set when impersonation is active

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-zinc-900 border-r border-zinc-800 flex flex-col">
      {/* Impersonation warning banner */}
      {isImpersonating && (
        <div className="bg-red-600/20 border-b border-red-500/30 px-4 py-2">
          <p className="text-xs text-red-400 font-medium">⚠️ Impersonating Studio</p>
          <p className="text-[10px] text-red-500 mt-0.5">All actions are logged</p>
        </div>
      )}

      {/* Logo */}
      <div className={`px-5 py-4 border-b border-zinc-800 ${isImpersonating ? 'bg-red-600/5' : ''}`}>
        <h1 className="text-lg font-semibold text-zinc-100">StudioDesk Admin</h1>
        <p className="text-xs text-zinc-500 mt-0.5">Platform Administration</p>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-zinc-800 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/50'
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-3 border-t border-zinc-800 space-y-2">
        <div className="flex items-center justify-between">
          <div className="min-w-0">
            <p className="text-sm font-medium text-zinc-200 truncate">{admin?.name}</p>
            <p className="text-xs text-zinc-500 truncate">{admin?.role}</p>
          </div>
          <button
            onClick={logout}
            className="text-xs text-zinc-500 hover:text-red-400 transition-colors"
          >
            Sign out
          </button>
        </div>
        {/* 2FA status */}
        {admin && (
          <Link
            href="/admin/settings/2fa"
            className={`flex items-center gap-1.5 text-xs px-2 py-1 rounded-md transition-colors ${
              admin.is_2fa_enabled
                ? 'text-green-400 hover:bg-zinc-800/50'
                : 'text-amber-400 hover:bg-amber-400/10 animate-pulse'
            }`}
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            {admin.is_2fa_enabled ? '2FA On' : '2FA Required'}
          </Link>
        )}
      </div>
    </aside>
  )
}
