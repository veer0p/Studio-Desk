'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { fetchReferralCode, generateReferralCode } from '@/lib/referral-api'

export default function ReferralSettingsPage() {
  const { data, isLoading } = useSWR('/api/v1/referral', fetchReferralCode, {
    revalidateOnFocus: false,
    revalidateOnReconnect: true,
    dedupingInterval: 30000,
  })

  const [generating, setGenerating] = useState(false)
  const [copied, setCopied] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setGenerating(true)
    setError('')
    try {
      await generateReferralCode()
      mutate('/api/v1/referral')
    } catch (err: any) {
      setError(err.message || 'Failed to generate code')
    } finally {
      setGenerating(false)
    }
  }

  const handleCopy = () => {
    if (data?.code?.code) {
      navigator.clipboard.writeText(data.code.code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="h-6 w-32 bg-zinc-800 rounded" />
        <div className="h-24 bg-zinc-900 rounded-lg" />
        <div className="h-40 bg-zinc-900 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Referral Program</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Earn free months by referring other studios</p>
      </div>

      {/* Referral Code Card */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Your Referral Code</h2>

        {data?.code ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <code className="text-2xl font-mono text-zinc-100 bg-zinc-800 px-4 py-2 rounded-md tracking-wider">
                {data.code.code}
              </code>
              <button
                onClick={handleCopy}
                className="px-3 py-2 text-sm rounded-md border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Reward</p>
                <p className="text-zinc-200 mt-0.5 capitalize">{data.code.reward_type.replace('_', ' ')}</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Used</p>
                <p className="text-zinc-200 mt-0.5">
                  {data.code.used_count} / {data.code.max_uses || '∞'}
                </p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Status</p>
                <p className="text-green-400 mt-0.5">Active</p>
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Expires</p>
                <p className="text-zinc-200 mt-0.5">
                  {data.code.expires_at
                    ? new Date(data.code.expires_at).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-zinc-500">
              Generate a referral code to start earning free months.
            </p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {generating ? 'Generating...' : 'Generate Code'}
            </button>
          </div>
        )}

        {error && (
          <p className="text-sm text-red-400 mt-3 bg-red-500/10 rounded-md px-3 py-2">{error}</p>
        )}
      </div>

      {/* Stats */}
      {data?.stats && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Total Redemptions</p>
            <p className="text-2xl font-semibold text-zinc-100 mt-1">{data.stats.total_redemptions}</p>
          </div>
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
            <p className="text-xs text-zinc-500 uppercase tracking-wider">Rewards Earned</p>
            <p className="text-2xl font-semibold text-zinc-100 mt-1">{data.stats.total_rewards}</p>
          </div>
        </div>
      )}

      {/* Redemption History */}
      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Redemption History</h2>
        {data?.redemptions?.length === 0 ? (
          <p className="text-sm text-zinc-500">No redemptions yet. Share your code to get started!</p>
        ) : (
          <div className="space-y-2">
            {data?.redemptions?.slice(0, 10).map((r: any) => (
              <div key={r.id} className="flex items-center justify-between text-sm py-2 border-b border-zinc-800/50 last:border-0">
                <div>
                  <span className="text-zinc-200 font-medium">{r.referred_studio_name}</span>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs text-zinc-600">
                    {new Date(r.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                  {r.rewarded ? (
                    <span className="text-xs px-2 py-0.5 rounded bg-green-500/10 text-green-400">Rewarded</span>
                  ) : (
                    <span className="text-xs px-2 py-0.5 rounded bg-zinc-800 text-zinc-500">Pending</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
