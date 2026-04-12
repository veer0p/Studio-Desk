'use client'

import { useCallback, useState } from 'react'
import useSWR, { mutate } from 'swr'
import {
  fetchApiKeys,
  createApiKey,
  revokeApiKey,
  toggleApiKey,
  type ApiKey,
} from '@/lib/api-keys-api'
import { Loader2, Plus, Copy, Check, AlertTriangle, Trash2, Power, PowerOff } from 'lucide-react'

const SCOPE_GROUPS = [
  {
    label: 'Bookings',
    items: [
      { value: 'bookings:read', label: 'Read' },
      { value: 'bookings:write', label: 'Write' },
    ],
  },
  {
    label: 'Clients',
    items: [
      { value: 'clients:read', label: 'Read' },
      { value: 'clients:write', label: 'Write' },
    ],
  },
  {
    label: 'Invoices',
    items: [
      { value: 'invoices:read', label: 'Read' },
      { value: 'invoices:write', label: 'Write' },
    ],
  },
  {
    label: 'Gallery',
    items: [
      { value: 'gallery:read', label: 'Read' },
    ],
  },
]

const ALL_SCOPES = SCOPE_GROUPS.flatMap((g) => g.items.map((i) => i.value))

const EXPIRY_OPTIONS = [
  { label: 'Never', value: '' },
  { label: '30 days', value: '30' },
  { label: '90 days', value: '90' },
  { label: '1 year', value: '365' },
]

function formatRelativeDate(dateStr: string | null): string {
  if (!dateStr) return 'Never'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'Never'
  const now = new Date()
  const diffMs = date.getTime() - now.getTime()
  const diffDays = Math.floor(diffMs / 86400000)
  if (diffDays === 0) return 'Today'
  if (diffDays === 1) return 'Tomorrow'
  if (diffDays > 1) return `In ${diffDays} days`
  if (diffDays === -1) return 'Yesterday'
  return `${Math.abs(diffDays)} days ago`
}

function ScopeBadge({ scope }: { scope: string }) {
  return (
    <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border border-zinc-700 text-zinc-400 bg-zinc-800/50">
      {scope}
    </span>
  )
}

function KeyStatusBadge({ apiKey }: { apiKey: ApiKey }) {
  if (apiKey.revoked_at) {
    return (
      <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm bg-red-500/10 text-red-400 border border-red-500/20">
        Revoked
      </span>
    )
  }
  if (apiKey.expires_at && new Date(apiKey.expires_at) < new Date()) {
    return (
      <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm bg-zinc-800 text-zinc-500 border border-zinc-700">
        Expired
      </span>
    )
  }
  if (!apiKey.is_active) {
    return (
      <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm bg-zinc-800 text-zinc-400 border border-zinc-700">
        Inactive
      </span>
    )
  }
  return (
    <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm bg-green-500/10 text-green-400 border border-green-500/20">
      Active
    </span>
  )
}

export function ApiKeysSettings() {
  const { data: keys, isLoading } = useSWR<ApiKey[]>('/api/v1/api-keys', fetchApiKeys, {
    revalidateOnFocus: false,
  })

  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [showKeyResult, setShowKeyResult] = useState(false)
  const [generatedKey, setGeneratedKey] = useState<string | null>(null)
  const [creating, setCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Create form state
  const [newKeyName, setNewKeyName] = useState('')
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['bookings:read'])
  const [expiry, setExpiry] = useState('')

  // Revoke confirmation
  const [revokeTarget, setRevokeTarget] = useState<ApiKey | null>(null)
  const [revoking, setRevoking] = useState(false)

  // Toggling state
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Copy state
  const [copied, setCopied] = useState(false)

  const toggleScope = useCallback((scope: string) => {
    setSelectedScopes((prev) =>
      prev.includes(scope) ? prev.filter((s) => s !== scope) : [...prev, scope]
    )
  }, [])

  const handleCreate = async () => {
    if (!newKeyName.trim() || selectedScopes.length === 0) return
    setCreating(true)
    setError(null)
    try {
      let expiresAt: string | null = null
      if (expiry) {
        const days = parseInt(expiry, 10)
        const date = new Date()
        date.setDate(date.getDate() + days)
        expiresAt = date.toISOString()
      }

      const result = await createApiKey(newKeyName.trim(), selectedScopes, expiresAt)
      setGeneratedKey(result.key)
      setShowKeyResult(true)
      setShowCreateDialog(false)
      setNewKeyName('')
      setSelectedScopes(['bookings:read'])
      setExpiry('')
      await mutate('/api/v1/api-keys')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to create key')
    } finally {
      setCreating(false)
    }
  }

  const handleRevoke = async () => {
    if (!revokeTarget) return
    setRevoking(true)
    setError(null)
    try {
      await revokeApiKey(revokeTarget.id)
      setRevokeTarget(null)
      await mutate('/api/v1/api-keys')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to revoke key')
    } finally {
      setRevoking(false)
    }
  }

  const handleToggle = async (apiKey: ApiKey) => {
    setTogglingId(apiKey.id)
    setError(null)
    try {
      await toggleApiKey(apiKey.id, !apiKey.is_active)
      await mutate('/api/v1/api-keys')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to toggle key')
    } finally {
      setTogglingId(null)
    }
  }

  const copyGeneratedKey = async () => {
    if (!generatedKey) return
    await navigator.clipboard.writeText(generatedKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const closeKeyResult = () => {
    setShowKeyResult(false)
    setGeneratedKey(null)
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="h-6 w-32 bg-zinc-800 rounded-sm animate-pulse" />
            <div className="h-4 w-56 bg-zinc-800/50 rounded-sm animate-pulse mt-2" />
          </div>
          <div className="h-9 w-36 bg-zinc-800 rounded-md animate-pulse" />
        </div>
        <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-8 animate-pulse">
          <div className="h-8 bg-zinc-800/50 rounded-sm" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">API Keys</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage API keys for external integrations and automations.</p>
        </div>
        <button
          onClick={() => { setShowCreateDialog(true); setError(null) }}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Generate New Key
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      {/* Generated Key Display */}
      {showKeyResult && generatedKey && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/5 p-4 space-y-3">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="text-amber-600 text-xs font-medium">This key will not be shown again.</p>
              <p className="text-amber-600/70 text-xs">Copy it now and store it securely.</p>
            </div>
          </div>
          <code className="block font-mono text-xs tracking-wider bg-zinc-800/80 text-zinc-100 p-3 rounded-sm break-all select-all">
            {generatedKey}
          </code>
          <div className="flex gap-2">
            <button
              onClick={copyGeneratedKey}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 text-xs font-medium rounded-sm transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy Key'}
            </button>
            <button
              onClick={closeKeyResult}
              className="px-3 py-1.5 text-zinc-400 hover:text-zinc-300 text-xs rounded-sm hover:bg-zinc-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Keys List */}
      {!keys || keys.length === 0 ? (
        <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-500">No API keys yet.</p>
          <p className="text-xs text-zinc-600 mt-1">Generate a key to connect external services like Zapier or custom webhooks.</p>
        </div>
      ) : (
        <div className="rounded-md border border-zinc-800 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-zinc-900/80 border-b border-zinc-800">
              <tr>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Key</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Scopes</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Last Used</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/50">
              {keys.map((apiKey) => (
                <tr key={apiKey.id} className="hover:bg-zinc-800/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-zinc-200">{apiKey.name}</div>
                    <div className="text-[10px] text-zinc-600 mt-0.5 font-mono">
                      {apiKey.expires_at ? `Expires ${formatRelativeDate(apiKey.expires_at)}` : 'No expiry'}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <code className="font-mono text-xs tracking-wider text-zinc-500 bg-zinc-800/50 px-2 py-1 rounded-sm">
                      {apiKey.key_prefix}••••••••
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {apiKey.scopes.slice(0, 3).map((scope) => (
                        <ScopeBadge key={scope} scope={scope} />
                      ))}
                      {apiKey.scopes.length > 3 && (
                        <span className="text-[10px] text-zinc-600 px-1 py-0.5">+{apiKey.scopes.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <KeyStatusBadge apiKey={apiKey} />
                  </td>
                  <td className="px-4 py-3 text-xs text-zinc-500">
                    {formatRelativeDate(apiKey.last_used_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      {!apiKey.revoked_at && (
                        <>
                          <button
                            onClick={() => handleToggle(apiKey)}
                            disabled={togglingId === apiKey.id}
                            className="p-1.5 rounded-sm text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-40"
                            title={apiKey.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {togglingId === apiKey.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : apiKey.is_active ? (
                              <PowerOff className="w-3.5 h-3.5" />
                            ) : (
                              <Power className="w-3.5 h-3.5" />
                            )}
                          </button>
                          <button
                            onClick={() => setRevokeTarget(apiKey)}
                            className="p-1.5 rounded-sm text-zinc-500 hover:text-red-400 hover:bg-zinc-800 transition-colors"
                            title="Revoke key"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Dialog */}
      {showCreateDialog && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => { setShowCreateDialog(false); setError(null) }}
        >
          <div
            className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-md p-6 space-y-5 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div>
              <h2 className="text-lg font-medium text-zinc-100">Generate API Key</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Create a new key for external service access.</p>
            </div>

            {/* Name */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Key Name</label>
              <input
                type="text"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                placeholder="e.g., Zapier Integration"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
                autoFocus
              />
            </div>

            {/* Scopes */}
            <div>
              <label className="block text-xs text-zinc-400 mb-2 font-medium">Permissions</label>
              <div className="space-y-3">
                {SCOPE_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 mb-1.5">
                      {group.label}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.items.map((item) => (
                        <label
                          key={item.value}
                          className={`flex items-center gap-2 text-xs px-2.5 py-1.5 rounded-sm border cursor-pointer transition-colors ${
                            selectedScopes.includes(item.value)
                              ? 'bg-zinc-700 border-zinc-600 text-zinc-200'
                              : 'bg-zinc-800/50 border-zinc-700/50 text-zinc-400 hover:bg-zinc-800'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={selectedScopes.includes(item.value)}
                            onChange={() => toggleScope(item.value)}
                            className="sr-only"
                          />
                          <span className={`w-3 h-3 rounded-sm border flex items-center justify-center ${
                            selectedScopes.includes(item.value)
                              ? 'bg-zinc-100 border-zinc-100'
                              : 'border-zinc-600'
                          }`}>
                            {selectedScopes.includes(item.value) && (
                              <Check className="w-2 h-2 text-zinc-900" />
                            )}
                          </span>
                          {item.label}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Expiry */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Expiry</label>
              <select
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 appearance-none"
              >
                {EXPIRY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => { setShowCreateDialog(false); setError(null) }}
                className="flex-1 px-3 py-2 border border-zinc-700 text-zinc-400 text-sm font-medium rounded-sm hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreate}
                disabled={creating || !newKeyName.trim() || selectedScopes.length === 0}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-100 text-zinc-900 text-sm font-medium rounded-md transition-colors"
              >
                {creating && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {creating ? 'Generating...' : 'Generate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Revoke Confirmation */}
      {revokeTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => !revoking && setRevokeTarget(null)}
        >
          <div
            className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-md p-6 space-y-4 mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-2 text-red-400">
              <AlertTriangle className="w-5 h-5" />
              <h3 className="text-base font-medium">Revoke API Key</h3>
            </div>
            <p className="text-sm text-zinc-400">
              Are you sure you want to revoke <span className="text-zinc-200 font-medium">{revokeTarget.name}</span>?
              This action cannot be undone. Any service using this key will lose access immediately.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setRevokeTarget(null)}
                disabled={revoking}
                className="flex-1 px-3 py-2 border border-zinc-700 text-zinc-400 text-sm font-medium rounded-sm hover:bg-zinc-800 transition-colors disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                onClick={handleRevoke}
                disabled={revoking}
                className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 disabled:opacity-40 text-red-400 text-sm font-medium rounded-sm transition-colors"
              >
                {revoking && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {revoking ? 'Revoking...' : 'Revoke'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
