const API_BASE = typeof window !== 'undefined' ? window.location.origin : ''

export interface WhatsAppTemplate {
  id: string
  studio_id: string
  automation_type: string
  template_name: string
  provider: string
  provider_template_id: string | null
  language: string
  category: string
  body_text: string
  variables: string[]
  status: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface EmailTemplate {
  id: string
  studio_id: string
  automation_type: string
  name: string
  subject: string
  html_body: string
  text_body: string | null
  variables_used: string[]
  is_default: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface TemplatesData {
  whatsapp: WhatsAppTemplate[]
  email: EmailTemplate[]
}

export async function fetchTemplates(): Promise<TemplatesData> {
  const res = await fetch(`${API_BASE}/api/v1/settings/templates`, {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to fetch templates' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  const json = await res.json()
  return json.data as TemplatesData
}

export async function saveTemplate(data: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/v1/settings/templates`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to save template' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  const json = await res.json()
  return json.data
}

export async function updateTemplate(id: string, data: Record<string, any>) {
  const res = await fetch(`${API_BASE}/api/v1/settings/templates/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(data),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to update template' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  return (await res.json()).data
}

export async function deleteTemplate(id: string) {
  const res = await fetch(`${API_BASE}/api/v1/settings/templates/${id}`, {
    method: 'DELETE',
    credentials: 'include',
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Failed to delete template' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
}

export async function previewTemplate(content: string, variables: Record<string, string>) {
  const res = await fetch(`${API_BASE}/api/v1/settings/templates/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({ template_content: content, variables }),
  })
  if (!res.ok) {
    const error = await res.json().catch(() => ({ error: 'Preview failed' }))
    throw new Error(error.error || `HTTP ${res.status}`)
  }
  const json = await res.json()
  return json.data.rendered as string
}
