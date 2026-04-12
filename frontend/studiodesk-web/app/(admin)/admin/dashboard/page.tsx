'use client'

import useSWR from 'swr'
import Link from 'next/link'
import { useAdminAuth } from '@/hooks/use-admin-auth'
import { fetchAdminDashboard, AdminDashboardData } from '@/lib/admin-api'

function StatCard({ label, value, sub, color = 'zinc' }: { label: string; value: string | number; sub?: string; color?: string }) {
  const colorMap: Record<string, string> = {
    blue: 'border-blue-500/20 bg-blue-500/5',
    green: 'border-green-500/20 bg-green-500/5',
    red: 'border-red-500/20 bg-red-500/5',
    amber: 'border-amber-500/20 bg-amber-500/5',
    zinc: 'border-zinc-800 bg-zinc-900/50',
  }
  return (
    <div className={`rounded-lg border ${colorMap[color] || colorMap.zinc} p-4`}>
      <p className="text-xs text-zinc-500 uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-semibold text-zinc-100 mt-1">{value}</p>
      {sub && <p className="text-xs text-zinc-500 mt-0.5">{sub}</p>}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { admin, isLoading: authLoading } = useAdminAuth()
  const { data, isLoading, error } = useSWR<AdminDashboardData>('/admin/dashboard', fetchAdminDashboard, {
    revalidateOnFocus: false,
    refreshInterval: 120000,
  })

  if (authLoading || isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-zinc-800 rounded" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-24 bg-zinc-900 rounded-lg border border-zinc-800" />
          ))}
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-red-400 text-sm">
        Failed to load dashboard data.
      </div>
    )
  }

  const { overview, health } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Platform Overview</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Welcome back, {admin?.name}</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Studios" value={overview.total_studios} sub={`${overview.recent_studios} this week`} color="blue" />
        <StatCard label="Active" value={overview.active_studios} sub={`${overview.paid_studios} paid, ${overview.trialing_studios} trialing`} color="green" />
        <StatCard label="Suspended" value={overview.suspended_studios} sub={health.unhealthy_studios.length > 0 ? `${health.unhealthy_studios.length} need attention` : undefined} color="red" />
        <StatCard label="Storage" value={`${overview.storage.used_gb.toFixed(1)} GB`} sub={`${overview.storage.usage_pct}% of ${overview.storage.limit_gb} GB`} color="amber" />
      </div>

      {/* Tier Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h2 className="text-sm font-medium text-zinc-300 mb-3">Studios by Plan Tier</h2>
          <div className="space-y-2">
            {Object.entries(overview.by_tier).map(([tier, count]) => (
              <div key={tier} className="flex items-center justify-between text-sm">
                <span className="text-zinc-400 capitalize">{tier}</span>
                <span className="text-zinc-200 font-medium">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Critical Errors */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <h2 className="text-sm font-medium text-zinc-300 mb-3">System Health</h2>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Critical Errors (24h)</span>
              <span className={`font-medium ${health.critical_errors_24h > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {health.critical_errors_24h}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Unhealthy Studios</span>
              <span className={`font-medium ${health.unhealthy_studios.length > 0 ? 'text-amber-400' : 'text-green-400'}`}>
                {health.unhealthy_studios.length}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-400">Storage Critical</span>
              <span className={`font-medium ${health.storage_critical.length > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {health.storage_critical.length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Health Alerts */}
      {(health.unhealthy_studios.length > 0 || health.storage_critical.length > 0) && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-4">
          <h2 className="text-sm font-medium text-amber-300 mb-3">Attention Required</h2>
          <div className="space-y-2">
            {health.unhealthy_studios.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div>
                  <Link href={`/admin/studios/${s.id}`} className="text-zinc-200 hover:text-blue-400 font-medium">
                    {s.name}
                  </Link>
                  <span className="text-zinc-600 mx-1">·</span>
                  <span className="text-zinc-500">{s.slug}</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  {s.issue}
                </span>
              </div>
            ))}
            {health.storage_critical.map((s) => (
              <div key={s.id} className="flex items-center justify-between text-sm">
                <div>
                  <Link href={`/admin/studios/${s.id}`} className="text-zinc-200 hover:text-blue-400 font-medium">
                    {s.name}
                  </Link>
                  <span className="text-zinc-600 mx-1">·</span>
                  <span className="text-zinc-500">storage at {s.usage_pct}%</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  storage critical
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
