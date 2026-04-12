'use client'

import useSWR from 'swr'
import { fetchAdminPlans, PlanRecord } from '@/lib/admin-api'

export default function AdminPlansPage() {
  const { data, isLoading } = useSWR<PlanRecord[]>('/admin/plans', fetchAdminPlans, { revalidateOnFocus: false })

  const tierColor: Record<string, string> = {
    starter: 'text-zinc-400',
    studio: 'text-blue-400',
    agency: 'text-amber-400',
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Subscription Plans</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage platform pricing tiers</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-zinc-900 rounded-lg border border-zinc-800" />
          ))}
        </div>
      ) : data?.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">No plans configured.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data?.map((plan) => (
            <div key={plan.id} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className={`text-lg font-semibold capitalize ${tierColor[plan.tier] || 'text-zinc-200'}`}>
                  {plan.name}
                </h2>
                <span className={`text-xs px-2 py-0.5 rounded-full border ${
                  plan.is_active
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border-red-500/20'
                }`}>
                  {plan.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500">Monthly</span>
                  <span className="text-zinc-200">₹{Number(plan.monthly_price_inr).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Annual</span>
                  <span className="text-zinc-200">₹{Number(plan.annual_price_inr).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Team Members</span>
                  <span className="text-zinc-200">{plan.max_team_members}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500">Storage</span>
                  <span className="text-zinc-200">{plan.storage_limit_gb} GB</span>
                </div>
                {plan.max_bookings_per_month && (
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Bookings/Month</span>
                    <span className="text-zinc-200">{plan.max_bookings_per_month}</span>
                  </div>
                )}
              </div>

              {plan.features && plan.features.length > 0 && (
                <div className="mt-4 pt-3 border-t border-zinc-800">
                  <ul className="space-y-1 text-xs text-zinc-400">
                    {plan.features.map((f, i) => (
                      <li key={i}>✓ {f}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
