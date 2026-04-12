'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import useSWR, { mutate } from 'swr'
import { setup2FA, enable2FA, disable2FA } from '@/lib/admin-api'
import { useAdminAuth } from '@/hooks/use-admin-auth'

export default function Admin2FASettingsPage() {
  const { admin, isAuthenticated } = useAdminAuth()
  const router = useRouter()
  const [step, setStep] = useState<'idle' | 'setup' | 'verify'>('idle')
  const [secret, setSecret] = useState('')
  const [otpUri, setOtpUri] = useState('')
  const [token, setToken] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')

  const handleSetup = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      const result = await setup2FA()
      setSecret(result.secret)
      setOtpUri(result.otp_uri)
      setStep('verify')
    } catch (err: any) {
      setError(err.message || 'Failed to generate 2FA secret')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    setError('')
    setLoading(true)

    try {
      await enable2FA(secret, token)
      setSuccess('2FA enabled successfully!')
      setStep('idle')
      setSecret('')
      setOtpUri('')
      setToken('')
      mutate('/api/v1/admin/auth/me')
    } catch (err: any) {
      setError(err.message || 'Invalid code. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable = async () => {
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      await disable2FA()
      setSuccess('2FA disabled.')
      mutate('/api/v1/admin/auth/me')
    } catch (err: any) {
      setError(err.message || 'Failed to disable 2FA')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    router.push('/admin/login')
    return null
  }

  const isSuperAdmin = admin?.role === 'super_admin'

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-zinc-100">Two-Factor Authentication</h1>
        <p className="text-sm text-zinc-500 mt-0.5">
          {isSuperAdmin
            ? 'Required for super_admin accounts. Currently ' + (admin?.is_2fa_enabled ? 'enabled' : 'disabled') + '.'
            : 'Optional for your role. Currently ' + (admin?.is_2fa_enabled ? 'enabled' : 'disabled') + '.'}
        </p>
      </div>

      {admin?.is_2fa_enabled ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span className="text-sm text-green-400 font-medium">2FA is enabled</span>
          </div>

          {!isSuperAdmin && (
            <button
              onClick={handleDisable}
              disabled={loading}
              className="px-4 py-2 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
            >
              {loading ? 'Disabling...' : 'Disable 2FA'}
            </button>
          )}

          {isSuperAdmin && (
            <p className="text-xs text-zinc-500">
              2FA cannot be disabled for super_admin accounts.
            </p>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6 space-y-4">
          {step === 'idle' && (
            <div className="space-y-3">
              <p className="text-sm text-zinc-400">
                {isSuperAdmin
                  ? '2FA is required for your role. Please set it up to continue.'
                  : 'Enable 2FA to add an extra layer of security to your account.'}
              </p>
              <button
                onClick={handleSetup}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
              >
                {loading ? 'Generating...' : 'Set up 2FA'}
              </button>
            </div>
          )}

          {step === 'verify' && (
            <div className="space-y-4">
              <p className="text-sm text-zinc-400">
                Scan the QR code below with your authenticator app (Google Authenticator, Authy, etc.), then enter the 6-digit code.
              </p>

              {/* QR Code */}
              <div className="flex justify-center py-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(otpUri)}`}
                  alt="2FA QR Code"
                  className="w-48 h-48 bg-white rounded-lg p-2"
                />
              </div>

              {/* Manual secret */}
              <div className="text-center">
                <p className="text-xs text-zinc-500 mb-1">Or enter manually:</p>
                <code className="text-sm font-mono bg-zinc-800 px-3 py-1.5 rounded text-zinc-300 tracking-wider">
                  {secret.match(/.{1,4}/g)?.join(' ') || secret}
                </code>
              </div>

              {/* Token input */}
              <div>
                <label className="block text-xs text-zinc-500 mb-1">Verification code</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-36 bg-zinc-800 border border-zinc-700 rounded-md px-3 py-2 text-sm text-zinc-100 text-center tracking-[0.5em] font-mono placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                  autoFocus
                />
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleVerify}
                  disabled={loading || token.length !== 6}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium rounded-md transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
                <button
                  onClick={() => { setStep('idle'); setSecret(''); setOtpUri(''); setToken('') }}
                  className="px-4 py-2 bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium rounded-md transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500/20 text-green-400 text-sm rounded-md px-3 py-2">
          {success}
        </div>
      )}
    </div>
  )
}
