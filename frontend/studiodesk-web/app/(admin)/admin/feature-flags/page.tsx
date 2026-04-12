'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { fetchFeatureFlags, createFeatureFlag, updateFeatureFlag, deleteFeatureFlag, FeatureFlag } from '@/lib/admin-api'

export default function AdminFeatureFlagsPage() {
  const [newFlag, setNewFlag] = useState('')
  const [desc, setDesc] = useState('')
  const { data, isLoading } = useSWR<FeatureFlag[]>('/admin/feature-flags', fetchFeatureFlags, { revalidateOnFocus: false })

  const handleToggle = async (flag: FeatureFlag) => {
    try {
      await updateFeatureFlag(flag.id, { is_enabled: !flag.is_enabled })
      mutate('/admin/feature-flags')
    } catch (err: any) {
      alert('Failed to toggle flag')
    }
  }

  const handleCreate = async () => {
    if (!newFlag.trim()) return
    try {
      await createFeatureFlag({ flag_name: newFlag.trim(), description: desc || undefined, is_enabled: false })
      setNewFlag('')
      setDesc('')
      mutate('/admin/feature-flags')
    } catch (err: any) {
      alert('Failed to create flag')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this feature flag?')) return
    try {
      await deleteFeatureFlag(id)
      mutate('/admin/feature-flags')
    } catch (err: any) {
      alert('Failed to delete flag')
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Feature Flags</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Toggle features for specific plan tiers</p>
      </div>

      {/* Create */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
        <h2 className="text-sm font-medium text-zinc-300 mb-3">Create New Flag</h2>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">Flag Name</label>
            <input
              type="text"
              value={newFlag}
              onChange={(e) => setNewFlag(e.target.value)}
              placeholder="e.g., video_delivery"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs text-zinc-500 mb-1">Description</label>
            <input
              type="text"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="What does this flag control?"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
            />
          </div>
          <button
            onClick={handleCreate}
            disabled={!newFlag.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
          >
            Create
          </button>
        </div>
      </div>

      {/* List */}
      <div className="rounded-lg border border-zinc-800 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-zinc-900 border-b border-zinc-800">
            <tr>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Flag</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Description</th>
              <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Enabled For</th>
              <th className="text-center px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/50">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="px-4 py-3"><div className="h-4 w-24 bg-zinc-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-48 bg-zinc-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-16 bg-zinc-800 rounded" /></td>
                  <td className="px-4 py-3"><div className="h-5 w-14 bg-zinc-800 rounded-full mx-auto" /></td>
                  <td className="px-4 py-3"><div className="h-4 w-12 bg-zinc-800 rounded ml-auto" /></td>
                </tr>
              ))
            ) : data?.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-zinc-500">No feature flags configured.</td>
              </tr>
            ) : (
              data?.map((flag) => (
                <tr key={flag.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-zinc-200">{flag.flag_name}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">{flag.description || '—'}</td>
                  <td className="px-4 py-3 text-zinc-400 text-xs">
                    {flag.enabled_for_tiers?.join(', ') || 'All'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => handleToggle(flag)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                        flag.is_enabled ? 'bg-green-500' : 'bg-zinc-600'
                      }`}
                    >
                      <span className={`inline-block h-3.5 w-3.5 rounded-full bg-white transition-transform ${
                        flag.is_enabled ? 'translate-x-[18px]' : 'translate-x-[3px]'
                      }`} />
                    </button>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      onClick={() => handleDelete(flag.id)}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
