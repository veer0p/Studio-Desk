'use client'

import { useCallback, useState } from 'react'
import useSWR, { mutate } from 'swr'
import {
  fetchContractClauses,
  createContractClause,
  updateContractClause,
  deleteContractClause,
  fetchContractClauseDefaults,
  type ContractClause,
  type ContractClauseDefaults,
} from '@/lib/api'
import { Loader2, Plus, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Trash2, Edit2, Check, X } from 'lucide-react'

const CATEGORIES = [
  { value: 'payment', label: 'Payment', color: 'emerald' },
  { value: 'delivery', label: 'Delivery', color: 'blue' },
  { value: 'liability', label: 'Liability', color: 'red' },
  { value: 'copyright', label: 'Copyright', color: 'purple' },
  { value: 'cancellation', label: 'Cancellation', color: 'amber' },
  { value: 'general', label: 'General', color: 'gray' },
] as const

type CategoryValue = (typeof CATEGORIES)[number]['value']

const COLOR_MAP: Record<string, { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  blue: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/20' },
  red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
  purple: { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/20' },
  amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
  gray: { bg: 'bg-zinc-500/10', text: 'text-zinc-400', border: 'border-zinc-500/20' },
}

const VARIABLES = [
  { label: 'studio_name', value: '{{studio_name}}' },
  { label: 'client_name', value: '{{client_name}}' },
  { label: 'delivery_days', value: '{{delivery_days}}' },
  { label: 'revision_count', value: '{{revision_count}}' },
  { label: 'amount', value: '{{amount}}' },
]

function CategoryBadge({ category }: { category: string }) {
  const cat = CATEGORIES.find((c) => c.value === category)
  const colors = COLOR_MAP[cat?.color ?? 'gray']
  return (
    <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
      {cat?.label ?? category}
    </span>
  )
}

function ClauseContentPreview({ content, expanded }: { content: string; expanded: boolean }) {
  if (expanded) {
    return (
      <p className="text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
        {content}
      </p>
    )
  }
  return (
    <p className="text-sm text-zinc-500 line-clamp-2 font-mono leading-relaxed">
      {content}
    </p>
  )
}

function VariableInserter({ onInsert }: { onInsert: (variable: string) => void }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-600 self-center mr-1">Insert:</span>
      {VARIABLES.map((v) => (
        <button
          key={v.value}
          type="button"
          onClick={() => onInsert(v.value)}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-sm bg-zinc-800/50 text-xs font-mono border border-zinc-700/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          title={`Insert ${v.label}`}
        >
          {v.label}
        </button>
      ))}
    </div>
  )
}

function ClauseEditor({
  clause,
  defaults,
  onSave,
  onCancel,
}: {
  clause: {
    id?: string
    title: string
    category: CategoryValue
    content: string
    is_active?: boolean
    sort_order?: number
  }
  defaults: ContractClauseDefaults[]
  onSave: (data: {
    title: string
    category: CategoryValue
    content: string
    is_active: boolean
    sort_order: number
  }) => Promise<void>
  onCancel: () => void
}) {
  const [title, setTitle] = useState(clause.title)
  const [category, setCategory] = useState<CategoryValue>(clause.category)
  const [content, setContent] = useState(clause.content)
  const [isActive, setIsActive] = useState(clause.is_active ?? true)
  const [sortOrder, setSortOrder] = useState(clause.sort_order ?? 0)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const insertVariable = useCallback((variable: string) => {
    setContent((prev) => {
      const textarea = document.getElementById('clause-content-textarea')
      const start = textarea?.selectionStart ?? prev.length
      const end = textarea?.selectionEnd ?? prev.length
      return prev.slice(0, start) + variable + prev.slice(end)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim()) return
    setSaving(true)
    setError(null)
    try {
      await onSave({
        title: title.trim(),
        category,
        content: content.trim(),
        is_active: isActive,
        sort_order: sortOrder,
      })
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const loadDefault = (def: ContractClauseDefaults) => {
    setCategory(def.category)
    setContent(def.content)
    setTitle(def.title)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      {/* Title + Category row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Cancellation Policy"
            className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            autoFocus={!clause.id}
            required
          />
        </div>
        <div>
          <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as CategoryValue)}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500 appearance-none"
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Content */}
      <div>
        <label className="block text-xs text-zinc-400 mb-1.5 font-medium">Clause Content</label>
        <VariableInserter onInsert={insertVariable} />
        <textarea
          id="clause-content-textarea"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={6}
          className="w-full mt-2 bg-zinc-800 border border-zinc-700 rounded-sm px-3 py-2 text-sm text-zinc-100 font-mono placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-500 resize-y"
          placeholder="Enter clause text. Use {{variable_name}} for dynamic content."
          required
        />
      </div>

      {/* Defaults quick load */}
      {defaults.length > 0 && (
        <div>
          <span className="text-[10px] font-mono tracking-widest uppercase text-zinc-600">Load from defaults:</span>
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {defaults.map((def, i) => (
              <button
                key={i}
                type="button"
                onClick={() => loadDefault(def)}
                className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm bg-zinc-800/50 text-zinc-500 border border-zinc-700/40 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                {def.title}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sort order + Active toggle */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <label className="text-xs text-zinc-400 font-medium">Sort Order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(parseInt(e.target.value, 10) || 0)}
            className="w-16 bg-zinc-800 border border-zinc-700 rounded-sm px-2 py-1 text-xs text-zinc-100 font-mono focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="rounded-sm border-zinc-700 bg-zinc-800 text-zinc-100 focus:ring-zinc-500/40"
          />
          <span className="text-xs text-zinc-400">Active</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-3 py-2 border border-zinc-700 text-zinc-400 text-sm font-medium rounded-sm hover:bg-zinc-800 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !title.trim() || !content.trim()}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 disabled:opacity-40 disabled:hover:bg-zinc-100 text-zinc-900 text-sm font-medium rounded-md transition-colors"
        >
          {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
          {saving ? 'Saving...' : 'Save Clause'}
        </button>
      </div>
    </form>
  )
}

function ClauseCard({
  clause,
  index,
  total,
  onMoveUp,
  onMoveDown,
  onToggle,
  onDelete,
  onUpdate,
}: {
  clause: ContractClause
  index: number
  total: number
  onMoveUp: (id: string) => void
  onMoveDown: (id: string) => void
  onToggle: (id: string, active: boolean) => void
  onDelete: (id: string) => void
  onUpdate: (id: string, data: {
    title: string
    category: CategoryValue
    content: string
    is_active: boolean
    sort_order: number
  }) => Promise<void>
}) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)

  return (
    <div className={`rounded-sm border transition-colors ${
      clause.is_active
        ? 'border-zinc-700/60 bg-zinc-900/30'
        : 'border-zinc-800/40 bg-zinc-900/10 opacity-60'
    }`}>
      {/* Header row */}
      <div className="flex items-start gap-3 p-3">
        <button
          onClick={() => { setExpanded(!expanded); setEditing(false) }}
          className="mt-0.5 text-zinc-500 hover:text-zinc-300 transition-colors shrink-0"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-medium text-zinc-200">{clause.title}</h4>
            <CategoryBadge category={clause.category} />
            {!clause.is_active && (
              <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm bg-zinc-800 text-zinc-500 border border-zinc-700">
                Inactive
              </span>
            )}
          </div>
          <ClauseContentPreview content={clause.content} expanded={expanded} />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onMoveUp(clause.id)}
            disabled={index === 0}
            className="p-1 rounded-sm text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-30"
            title="Move up"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onMoveDown(clause.id)}
            disabled={index === total - 1}
            className="p-1 rounded-sm text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors disabled:opacity-30"
            title="Move down"
          >
            <ArrowDown className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onToggle(clause.id, !clause.is_active)}
            className={`p-1 rounded-sm transition-colors ${
              clause.is_active
                ? 'text-zinc-600 hover:text-green-400 hover:bg-zinc-800'
                : 'text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800'
            }`}
            title={clause.is_active ? 'Deactivate' : 'Activate'}
          >
            {clause.is_active ? <Check className="w-3.5 h-3.5" /> : <X className="w-3.5 h-3.5" />}
          </button>
          <button
            onClick={() => { setEditing(true); setExpanded(true) }}
            className="p-1 rounded-sm text-zinc-600 hover:text-zinc-300 hover:bg-zinc-800 transition-colors"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(clause.id)}
            className="p-1 rounded-sm text-zinc-600 hover:text-red-400 hover:bg-zinc-800 transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 border-t border-zinc-800/40 pt-3">
          {editing ? (
            <ClauseEditor
              clause={clause}
              defaults={[]}
              onSave={async (data) => {
                await onUpdate(clause.id, data)
                setEditing(false)
              }}
              onCancel={() => { setEditing(false); if (!clause.is_active) setExpanded(false) }}
            />
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-zinc-300 font-mono whitespace-pre-wrap leading-relaxed">
                {clause.content}
              </p>
              <div className="flex items-center gap-4 text-xs text-zinc-600 font-mono">
                <span>Created: {new Date(clause.created_at).toLocaleDateString()}</span>
                <span>Updated: {new Date(clause.updated_at).toLocaleDateString()}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ContractClauseLibrary() {
  const { data, isLoading } = useSWR(
    '/api/v1/contract-clauses',
    () => fetchContractClauses(),
    { revalidateOnFocus: false }
  )
  const { data: defaults } = useSWR(
    '/api/v1/contract-clauses/defaults',
    () => fetchContractClauseDefaults(),
    { revalidateOnFocus: false }
  )

  const [showForm, setShowForm] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const clauses = data?.studio ?? []

  // Group by category
  const grouped = CATEGORIES.reduce((acc, cat) => {
    const categoryClauses = clauses.filter((c) => c.category === cat.value)
    if (categoryClauses.length > 0 || cat.value === 'general') {
      acc[cat.value] = categoryClauses
    }
    return acc
  }, {} as Record<string, ContractClause[]>)

  const handleCreate = async (clauseData: {
    title: string
    category: CategoryValue
    content: string
    is_active: boolean
    sort_order: number
  }) => {
    setError(null)
    await createContractClause(clauseData)
    await mutate('/api/v1/contract-clauses')
    setShowForm(false)
  }

  const handleUpdate = async (
    id: string,
    clauseData: {
      title: string
      category: CategoryValue
      content: string
      is_active: boolean
      sort_order: number
    }
  ) => {
    setError(null)
    await updateContractClause(id, clauseData)
    await mutate('/api/v1/contract-clauses')
  }

  const handleToggle = async (id: string, active: boolean) => {
    setError(null)
    await updateContractClause(id, { is_active: active })
    await mutate('/api/v1/contract-clauses')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this clause? This cannot be undone.')) return
    setDeletingId(id)
    setError(null)
    try {
      await deleteContractClause(id)
      await mutate('/api/v1/contract-clauses')
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    } finally {
      setDeletingId(null)
    }
  }

  const handleMove = async (id: string, direction: 'up' | 'down') => {
    const clause = clauses.find((c) => c.id === id)
    if (!clause) return
    const idx = clauses.indexOf(clause)
    const targetIdx = direction === 'up' ? idx - 1 : idx + 1
    if (targetIdx < 0 || targetIdx >= clauses.length) return

    const target = clauses[targetIdx]
    // Swap sort_order
    await Promise.all([
      updateContractClause(id, { sort_order: target.sort_order }),
      updateContractClause(target.id, { sort_order: clause.sort_order }),
    ])
    await mutate('/api/v1/contract-clauses')
  }

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 w-48 bg-zinc-800 rounded-sm" />
        <div className="h-4 w-64 bg-zinc-800/50 rounded-sm" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-zinc-900/50 rounded-sm" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-100">Contract Clause Library</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Manage reusable contract clauses and policies.</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-3 py-2 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 text-sm font-medium rounded-md transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Clause
        </button>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-sm px-3 py-2">
          {error}
        </div>
      )}

      {/* Create Form */}
      {showForm && (
        <div className="rounded-sm border border-zinc-700/60 bg-zinc-900/30 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-zinc-200">New Clause</h2>
            <button
              onClick={() => setShowForm(false)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <ClauseEditor
            clause={{ title: '', category: 'general', content: '' }}
            defaults={defaults ?? []}
            onSave={handleCreate}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      {/* Clauses grouped by category */}
      {clauses.length === 0 ? (
        <div className="rounded-sm border border-zinc-800 bg-zinc-900/50 p-8 text-center">
          <p className="text-sm text-zinc-500">No clauses yet.</p>
          <p className="text-xs text-zinc-600 mt-1">Add your first clause or load from system defaults.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {CATEGORIES.map((cat) => {
            const categoryClauses = grouped[cat.value] ?? []
            if (categoryClauses.length === 0) return null
            const colors = COLOR_MAP[cat.color]

            return (
              <div key={cat.value}>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm ${colors.bg} ${colors.text} border ${colors.border}`}>
                    {cat.label}
                  </span>
                  <span className="text-xs text-zinc-600">({categoryClauses.length})</span>
                </div>
                <div className="space-y-2">
                  {categoryClauses.map((clause, idx) => (
                    <ClauseCard
                      key={clause.id}
                      clause={clause}
                      index={idx}
                      total={categoryClauses.length}
                      onMoveUp={(id) => handleMove(id, 'up')}
                      onMoveDown={(id) => handleMove(id, 'down')}
                      onToggle={handleToggle}
                      onDelete={handleDelete}
                      onUpdate={handleUpdate}
                    />
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete confirmation handled inline */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-zinc-900 border border-zinc-800 rounded-sm p-6 space-y-4 mx-4">
            <div className="flex items-center gap-2 text-red-400">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-base font-medium">Delete Clause</h3>
            </div>
            <p className="text-sm text-zinc-400">Deleting clause... </p>
            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
          </div>
        </div>
      )}
    </div>
  )
}
