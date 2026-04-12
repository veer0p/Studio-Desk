'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { fetchAuditLogs, AuditLogEntry } from '@/lib/admin-api'
import { useAdminAuth } from '@/hooks/use-admin-auth'

export default function AdminAuditLogsPage() {
  const { isSuperAdmin } = useAdminAuth()
  const [page, setPage] = useState(0)
  const [actionFilter, setActionFilter] = useState('')
  const [entityFilter, setEntityFilter] = useState('')

  const { data, isLoading } = useSWR(
    ['/admin/audit-logs', page, actionFilter, entityFilter],
    () => fetchAuditLogs({
      page,
      pageSize: 50,
      action: actionFilter || undefined,
      entity_type: entityFilter || undefined,
    }),
    { revalidateOnFocus: false }
  )

  const actionColor = (action: string) => {
    if (action.startsWith('suspend')) return 'text-red-400'
    if (action.startsWith('reactivate')) return 'text-green-400'
    if (action.startsWith('create')) return 'text-blue-400'
    if (action.startsWith('update')) return 'text-amber-400'
    if (action.startsWith('delete')) return 'text-red-400'
    if (action.startsWith('login')) return 'text-zinc-400'
    return 'text-zinc-300'
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Audit Logs</h1>
          <p className="text-sm text-zinc-500 mt-0.5">All admin actions on the platform</p>
        </div>
        {isSuperAdmin && (
          <a
            href="/api/v1/admin/audit-logs/export"
            className="px-3 py-2 text-sm rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition-colors"
            download
          >
            Export CSV
          </a>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <input
          type="text"
          placeholder="Filter by action..."
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(0) }}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
        <input
          type="text"
          placeholder="Filter by entity..."
          value={entityFilter}
          onChange={(e) => { setEntityFilter(e.target.value); setPage(0) }}
          className="flex-1 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {/* Table */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Time</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Admin</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Action</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Entity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {isLoading ? (
              Array.from({ length: 20 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-zinc-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-32 bg-zinc-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-20 bg-zinc-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-zinc-800 rounded" /></td>
                </tr>
              ))
            ) : data?.logs.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">No audit logs found.</td>
              </tr>
            ) : (
              data?.logs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 text-zinc-500 text-xs whitespace-nowrap">
                    {new Date(log.created_at).toLocaleString('en-IN', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3 text-zinc-300 text-xs">
                    {log.platform_admins?.name || 'System'}
                  </td>
                  <td className={`px-4 py-3 font-mono text-xs ${actionColor(log.action)}`}>
                    {log.action}
                  </td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {log.entity_type}{log.entity_id ? ` (${log.entity_id.slice(0, 8)}...)` : ''}
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
          <span>Page {page + 1} of {data.meta.totalPages} ({data.meta.count} entries)</span>
          <div className="flex gap-2">
            <button disabled={page === 0} onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-md border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-300">
              Previous
            </button>
            <button disabled={page >= data.meta.totalPages - 1} onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-md border border-zinc-700 disabled:opacity-40 hover:bg-zinc-800 text-zinc-300">
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
