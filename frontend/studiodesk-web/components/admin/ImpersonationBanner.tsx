'use client'

/**
 * Impersonation Banner
 * 
 * Displays a prominent red banner at the top of the page when an admin
 * is impersonating a studio. Provides a quick "Stop Impersonation" button.
 * 
 * This component reads the impersonation state from sessionStorage, which
 * is set when the impersonate API call succeeds.
 */
export function ImpersonationBanner() {
  const impersonating = typeof window !== 'undefined' ? sessionStorage.getItem('impersonating_studio') : null
  const impersonationId = typeof window !== 'undefined' ? sessionStorage.getItem('impersonation_id') : null

  if (!impersonating) return null

  async function stopImpersonation() {
    try {
      const res = await fetch('/api/v1/admin/admin/stop-impersonate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ impersonation_id: impersonationId }),
      })

      if (res.ok) {
        sessionStorage.removeItem('impersonating_studio')
        sessionStorage.removeItem('impersonation_id')
        window.location.reload()
      }
    } catch {
      // Force clear even if API fails
      sessionStorage.removeItem('impersonating_studio')
      sessionStorage.removeItem('impersonation_id')
      window.location.reload()
    }
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-red-600 border-b border-red-700 px-4 py-2 flex items-center justify-between shadow-lg">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5 text-red-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <span className="text-sm font-medium text-white">
          Impersonating: <span className="font-semibold">{impersonating}</span>
        </span>
        <span className="text-xs text-red-200 ml-2">All actions are logged</span>
      </div>
      <button
        onClick={stopImpersonation}
        className="px-3 py-1.5 text-sm font-medium bg-white text-red-700 rounded-md hover:bg-red-50 transition-colors"
      >
        Stop Impersonation
      </button>
    </div>
  )
}
