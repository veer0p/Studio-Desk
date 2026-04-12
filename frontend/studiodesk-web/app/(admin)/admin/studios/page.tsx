'use client'

import { useState } from 'react'
import useSWR from 'swr'
import Link from 'next/link'
import { fetchAdminStudios, StudioRecord } from '@/lib/admin-api'

export default function AdminStudiosPage() {
  const [page, setPage] = useState(0)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<string>('')

  const { data, isLoading } = useSWR(
    ['/admin/studios', page, search, filter],
    () => fetchAdminStudios({ page, pageSize: 20, search: search || undefined, subscription_status: filter || undefined }),
    { revalidateOnFocus: false }
  )

  const statusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-400 border-green-500/20'
      case 'trialing': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
      case 'past_due': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
      case 'cancelled': return 'bg-red-500/10 text-red-400 border-red-500/20'
      default: return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Studios</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage all studios on the platform</p>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Search studios..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(0) }}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <select
          value={filter}
          onChange={(e) => { setFilter(e.target.value); setPage(0) }}
          className="bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="trialing">Trialing</option>
          <option value="past_due">Past Due</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Studio</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Plan</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Storage</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Created</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {isLoading ? (
              Array.from({ length: 10 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-32 bg-zinc-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-zinc-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-20 bg-zinc-800 rounded-full" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-zinc-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-zinc-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-12 bg-zinc-800 rounded ml-auto" /></td>
                </tr>
              ))
            ) : data?.studios.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-zinc-500">No studios found.</td>
              </tr>
            ) : (
              data?.studios.map((studio) => (
                <tr key={studio.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <Link href={`/admin/studios/${studio.id}`} className="text-zinc-200 hover:text-blue-400 font-medium">
                        {studio.name}
                      </Link>
                      <p className="text-xs text-zinc-500">{studio.slug}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-400 capitalize">{studio.plan_tier}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColor(studio.subscription_status)}`}>
                      {studio.subscription_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-zinc-400">
                    {studio.storage_used_gb.toFixed(1)} / {studio.storage_limit_gb} GB
                  </td>
                  <td className="px-4 py-3 text-zinc-500">
                    {new Date(studio.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/admin/studios/${studio.id}`} className="text-xs text-blue-400 hover:text-blue-300">
                      View →
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {data && data.meta.totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-zinc-500">
          <span>
            Page {page + 1} of {data.meta.totalPages} ({data.meta.count} studios)
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-md border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 transition-colors text-zinc-300"
            >
              Previous
            </button>
            <button
              disabled={page >= data.meta.totalPages - 1}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-md border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 transition-colors text-zinc-300"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
