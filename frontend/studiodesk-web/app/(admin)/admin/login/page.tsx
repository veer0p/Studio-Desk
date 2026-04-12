'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { adminLogin, adminLogin2FA } from '@/lib/admin-api'

type LoginStep = 'credentials' | '2fa'

export default function AdminLoginPage() {
  const router = useRouter()
  const [step, setStep] = useState<LoginStep>('credentials')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [totpToken, setTotpToken] = useState('')
  const [pendingAdminId, setPendingAdminId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const result = await adminLogin(email, password)

      if (result.requires_2fa && result.admin_id) {
        setPendingAdminId(result.admin_id)
        setStep('2fa')
        setLoading(false)
        return
      }

      router.push('/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  const handle2FASubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await adminLogin2FA(pendingAdminId, totpToken)
      router.push('/admin/dashboard')
      router.refresh()
    } catch (err: any) {
      setError(err.message || 'Invalid 2FA code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-semibold text-zinc-100">StudioDesk Admin</h1>
          <p className="text-sm text-zinc-500 mt-1">Platform Administration</p>
        </div>

        {/* Credentials Form */}
        {step === 'credentials' && (
          <form onSubmit={handleCredentialsSubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                placeholder="admin@studiodesk.in"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-zinc-300 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                placeholder="••••••••"
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-md py-2.5 transition-colors"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* 2FA Challenge */}
        {step === '2fa' && (
          <form onSubmit={handle2FASubmit} className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 space-y-4">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-md px-3 py-2">
                {error}
              </div>
            )}

            <div className="text-center">
              <svg className="w-10 h-10 mx-auto text-zinc-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <h2 className="text-lg font-medium text-zinc-100">Two-Factor Authentication</h2>
              <p className="text-sm text-zinc-500 mt-1">Enter the 6-digit code from your authenticator app</p>
            </div>

            <div>
              <label htmlFor="totp" className="block text-sm font-medium text-zinc-300 mb-1">
                Authentication Code
              </label>
              <input
                id="totp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={totpToken}
                onChange={(e) => setTotpToken(e.target.value.replace(/\D/g, ''))}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 text-center tracking-[0.5em] font-mono placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500/40"
                placeholder="000000"
                autoComplete="one-time-code"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || totpToken.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-blue-600/50 text-white text-sm font-medium rounded-md py-2.5 transition-colors"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>

            <button
              type="button"
              onClick={() => { setStep('credentials'); setPendingAdminId(''); setTotpToken('') }}
              className="w-full text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              ← Back to login
            </button>
          </form>
        )}

        <p className="text-xs text-zinc-600 text-center mt-4">
          Restricted to platform administrators only.
        </p>
      </div>
    </div>
  )
}
