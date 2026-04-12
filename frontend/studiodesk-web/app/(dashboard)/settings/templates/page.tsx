'use client'

import { useState } from 'react'
import useSWR, { mutate } from 'swr'
import { fetchTemplates, saveTemplate, deleteTemplate, previewTemplate, WhatsAppTemplate, EmailTemplate } from '@/lib/templates-api'

const AUTOMATION_TYPES = [
  'booking_confirmation',
  'booking_reminder',
  'payment_received',
  'payment_overdue',
  'gallery_ready',
  'contract_signed',
  'proposal_sent',
]

export default function TemplatesSettingsPage() {
  const { data, isLoading } = useSWR('/api/v1/settings/templates', fetchTemplates, {
    revalidateOnFocus: false,
  })

  const [tab, setTab] = useState<'whatsapp' | 'email'>('whatsapp')
  const [editingTemplate, setEditingTemplate] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [previewText, setPreviewText] = useState('')
  const [previewVars, setPreviewVars] = useState<Record<string, string>>({})
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const templates = tab === 'whatsapp' ? (data?.whatsapp || []) : (data?.email || [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError('')
    try {
      if (tab === 'whatsapp') {
        await saveTemplate({
          automation_type: editingTemplate.automation_type,
          template_name: editingTemplate.template_name,
          language: editingTemplate.language || 'en',
          category: editingTemplate.category || 'utility',
          body_text: editingTemplate.body_text,
          variables: editingTemplate.body_text.match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/[{}]/g, '')) || [],
          is_active: editingTemplate.is_active ?? true,
        })
      } else {
        await saveTemplate({
          automation_type: editingTemplate.automation_type,
          name: editingTemplate.name,
          subject: editingTemplate.subject,
          html_body: editingTemplate.html_body,
          variables_used: (editingTemplate.html_body + editingTemplate.subject).match(/\{\{(\w+)\}\}/g)?.map((v: string) => v.replace(/[{}]/g, '')) || [],
          is_active: editingTemplate.is_active ?? true,
        })
      }
      mutate('/api/v1/settings/templates')
      setShowForm(false)
      setEditingTemplate(null)
    } catch (err: any) {
      setError(err.message || 'Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this template?')) return
    try {
      await deleteTemplate(id)
      mutate('/api/v1/settings/templates')
    } catch (err: any) {
      setError(err.message || 'Failed to delete')
    }
  }

  const handlePreview = async () => {
    const content = tab === 'whatsapp' ? editingTemplate?.body_text : editingTemplate?.html_body
    if (!content) return
    try {
      const rendered = await previewTemplate(content, previewVars)
      setPreviewText(rendered)
    } catch {
      setPreviewText('Preview failed')
    }
  }

  const groupedTemplates = templates.reduce((acc: Record<string, any[]>, t: any) => {
    const type = t.automation_type || 'other'
    if (!acc[type]) acc[type] = []
    acc[type].push(t)
    return acc
  }, {})

  if (isLoading) {
    return <div className="animate-pulse space-y-4"><div className="h-6 w-32 bg-zinc-800 rounded" /><div className="h-48 bg-zinc-900 rounded-lg" /></div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Message Templates</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Manage WhatsApp and email templates for automations</p>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 border-b border-zinc-800">
        {(['whatsapp', 'email'] as const).map((t) => (
          <button
            key={t}
            onClick={() => { setTab(t); setShowForm(false) }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors capitalize ${
              tab === t ? 'border-blue-500 text-blue-400' : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {t === 'whatsapp' ? '💬 WhatsApp' : '📧 Email'}
          </button>
        ))}
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-md px-3 py-2">{error}</div>
      )}

      {/* Templates List */}
      <div className="space-y-4">
        {AUTOMATION_TYPES.map((type) => {
          const typeTemplates = groupedTemplates[type] || []
          return (
            <div key={type} className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-zinc-300 capitalize">{type.replace(/_/g, ' ')}</h3>
                {typeTemplates.length === 0 && (
                  <button
                    onClick={() => {
                      setEditingTemplate({
                        automation_type: type,
                        ...(tab === 'whatsapp' ? { template_name: '', body_text: '', language: 'en', category: 'utility' } : { name: '', subject: '', html_body: '' }),
                        is_active: true,
                      })
                      setShowForm(true)
                    }}
                    className="text-xs px-2 py-1 rounded border border-zinc-700 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
                  >
                    + Create
                  </button>
                )}
              </div>

              {typeTemplates.length === 0 ? (
                <p className="text-xs text-zinc-600">No template configured. Uses system default.</p>
              ) : (
                <div className="space-y-2">
                  {typeTemplates.map((t: any) => (
                    <div key={t.id} className="flex items-center justify-between text-sm py-2 px-3 bg-zinc-800/50 rounded">
                      <div className="flex-1 min-w-0">
                        <span className="text-zinc-200 font-medium">{t.template_name || t.name}</span>
                        <span className="text-zinc-600 mx-2">·</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${t.is_active ? 'bg-green-500/10 text-green-400' : 'bg-zinc-700 text-zinc-500'}`}>
                          {t.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => { setEditingTemplate(t); setShowForm(true) }}
                          className="text-xs text-zinc-500 hover:text-zinc-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(t.id)}
                          className="text-xs text-red-500/70 hover:text-red-400"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Edit/Create Modal */}
      {showForm && editingTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60" onClick={() => setShowForm(false)}>
          <div className="w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-medium text-zinc-100">
              {editingTemplate.id ? 'Edit' : 'Create'} {tab === 'whatsapp' ? 'WhatsApp' : 'Email'} Template
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {tab === 'whatsapp' ? (
                <>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1">Template Name</label>
                    <input
                      type="text"
                      value={editingTemplate.template_name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, template_name: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1">Body Text (use {'{{variable}}'} for dynamic content)</label>
                    <textarea
                      value={editingTemplate.body_text}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, body_text: e.target.value })}
                      rows={6}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-zinc-300 mb-1">Language</label>
                      <input
                        type="text"
                        value={editingTemplate.language}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, language: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-300 mb-1">Category</label>
                      <select
                        value={editingTemplate.category}
                        onChange={(e) => setEditingTemplate({ ...editingTemplate, category: e.target.value })}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      >
                        <option value="utility">Utility</option>
                        <option value="marketing">Marketing</option>
                        <option value="transactional">Transactional</option>
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1">Template Name</label>
                    <input
                      type="text"
                      value={editingTemplate.name}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1">Subject (use {'{{variable}}'})</label>
                    <input
                      type="text"
                      value={editingTemplate.subject}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-zinc-300 mb-1">HTML Body (use {'{{variable}}'})</label>
                    <textarea
                      value={editingTemplate.html_body}
                      onChange={(e) => setEditingTemplate({ ...editingTemplate, html_body: e.target.value })}
                      rows={8}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                      required
                    />
                  </div>
                </>
              )}

              {/* Preview */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm text-zinc-300">Preview</label>
                  <button type="button" onClick={handlePreview} className="text-xs text-blue-400 hover:text-blue-300">
                    Render Preview
                  </button>
                </div>
                <input
                  type="text"
                  placeholder='Variables as JSON: {"name":"John","date":"April 15"}'
                  onChange={(e) => { try { setPreviewVars(JSON.parse(e.target.value)) } catch {} }}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-xs text-zinc-100 font-mono placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                />
                {previewText && (
                  <div className="mt-2 bg-zinc-800 rounded-md p-3 text-xs text-zinc-300 font-mono whitespace-pre-wrap max-h-32 overflow-y-auto">
                    {previewText}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingTemplate.is_active}
                  onChange={(e) => setEditingTemplate({ ...editingTemplate, is_active: e.target.checked })}
                  className="rounded border-zinc-700 bg-zinc-800 text-blue-500 focus:ring-blue-500/40"
                />
                <label htmlFor="is_active" className="text-sm text-zinc-300">Active</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 px-3 py-2 border border-zinc-700 text-zinc-300 text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
                >
                  {saving ? 'Saving...' : 'Save Template'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
