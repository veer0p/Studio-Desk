'use client'

import useSWR, { mutate } from 'swr'
import { fetchFeatureFlags, FeatureFlag } from '@/lib/admin-api'

export default function AdminSettingsPage() {
  const { data: flags } = useSWR<FeatureFlag[]>('/admin/feature-flags', fetchFeatureFlags, { revalidateOnFocus: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Platform Settings</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Configure platform-wide settings</p>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Active Feature Flags</h2>
        <div className="space-y-2">
          {flags?.filter((f) => f.is_enabled).map((flag) => (
            <div key={flag.id} className="flex items-center justify-between text-sm py-1.5">
              <span className="text-zinc-300 font-mono">{flag.flag_name}</span>
              <span className="text-xs text-zinc-500">{flag.description || 'No description'}</span>
            </div>
          ))}
          {flags?.filter((f) => f.is_enabled).length === 0 && (
            <p className="text-sm text-zinc-500">No active feature flags.</p>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">System Info</h2>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-500">Environment</span>
            <span className="text-zinc-300">{process.env.NODE_ENV || 'development'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-500">Admin Routes</span>
            <span className="text-zinc-300">/api/v1/admin/*</span>
          </div>
        </div>
      </div>
    </div>
  )
}
