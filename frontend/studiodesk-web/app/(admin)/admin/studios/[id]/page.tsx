'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchAdminStudioDetail, suspendStudio, reactivateStudio, impersonateStudio, StudioDetailData } from '@/lib/admin-api'

export default function StudioDetailPage() {
  const params = useParams()
  const router = useRouter()
  const studioId = params.id as string
  const [reason, setReason] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [actionError, setActionError] = useState('')

  const { data, isLoading, error } = useSWR<StudioDetailData>(
    `/admin/studios/${studioId}`,
    () => fetchAdminStudioDetail(studioId),
    { revalidateOnFocus: false }
  )

  const handleAction = async (action: 'suspend' | 'reactivate' | 'impersonate') => {
    if (!reason.trim()) {
      setActionError('A reason is required for this action.')
      return
    }
    setActionLoading(action)
    setActionError('')

    try {
      if (action === 'suspend') {
        await suspendStudio(studioId, reason)
      } else if (action === 'reactivate') {
        await reactivateStudio(studioId, reason)
      } else {
        const result = await impersonateStudio(studioId, reason)
        // Store impersonation state in sessionStorage
        if (typeof window !== 'undefined' && result.impersonation_id) {
          sessionStorage.setItem('impersonating_studio', result.studio.name)
          sessionStorage.setItem('impersonation_id', result.impersonation_id)
        }
        // Redirect to impersonation confirmation
        setActionError('')
        setReason('')
        alert(result.message)
      }
      mutate(`/admin/studios/${studioId}`)
      setReason('')
    } catch (err: any) {
      setActionError(err.message || 'Action failed')
    } finally {
      setActionLoading(null)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-zinc-800 rounded" /><div className="h-64 bg-zinc-900 rounded-lg" /></div>
  }

  if (error || !data) {
    return <div className="text-red-400 text-sm">Failed to load studio details.</div>
  }

  const { studio, members, stats, support_notes } = data

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-1">
          <Link href="/admin/studios" className="hover:text-zinc-300">Studios</Link>
          <span>/</span>
          <span className="text-zinc-300">{studio.name}</span>
        </div>
        <h1 className="text-xl font-semibold text-zinc-100">{studio.name}</h1>
        <p className="text-sm text-zinc-500 mt-0.5">{studio.slug} · {studio.plan_tier} · {studio.subscription_status}</p>
      </div>

      {/* Action Panel */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-sm font-medium text-zinc-300 mb-3">Actions</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">Reason (required)</label>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g., Payment overdue for 30 days"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          {studio.is_suspended ? (
            <button
              onClick={() => handleAction('reactivate')}
              disabled={actionLoading !== null}
              className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {actionLoading === 'reactivate' ? 'Reactivating...' : 'Reactivate'}
            </button>
          ) : (
            <button
              onClick={() => handleAction('suspend')}
              disabled={actionLoading !== null}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {actionLoading === 'suspend' ? 'Suspending...' : 'Suspend'}
            </button>
          )}
          <button
            onClick={() => handleAction('impersonate')}
            disabled={actionLoading !== null}
            className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-zinc-200 text-sm font-medium rounded-md transition-colors"
          >
            {actionLoading === 'impersonate' ? 'Starting...' : 'Impersonate'}
          </button>
        </div>
        {actionError && <p className="text-sm text-red-400 mt-2">{actionError}</p>}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Bookings</p>
          <p className="text-2xl font-semibold text-zinc-100 mt-1">{stats.booking_count}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Galleries</p>
          <p className="text-2xl font-semibold text-zinc-100 mt-1">{stats.gallery_count}</p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Revenue</p>
          <p className="text-2xl font-semibold text-zinc-100 mt-1">₹{stats.total_revenue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</p>
        </div>
      </div>

      {/* Members */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-sm font-medium text-zinc-300 mb-3">Team Members ({members.length})</h2>
        <div className="space-y-2">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between text-sm py-1.5">
              <div>
                <span className="text-zinc-200 font-medium">{m.display_name}</span>
                <span className="text-zinc-600 mx-1">·</span>
                <span className="text-zinc-500">{m.email}</span>
              </div>
              <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 capitalize">{m.role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Support Notes */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-sm font-medium text-zinc-300 mb-3">Support Notes ({support_notes.length})</h2>
        {support_notes.length === 0 ? (
          <p className="text-sm text-zinc-500">No support notes yet.</p>
        ) : (
          <div className="space-y-2">
            {support_notes.slice(0, 10).map((note) => (
              <div key={note.id} className="text-sm py-1.5">
                <p className="text-zinc-300">{note.note}</p>
                <p className="text-xs text-zinc-600 mt-0.5">{new Date(note.created_at).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
