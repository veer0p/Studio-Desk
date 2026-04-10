"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, ArrowRight, AlertCircle } from "lucide-react"

export function PortalLoginPage({ studioSlug }: { studioSlug: string }) {
  const router = useRouter()
  const [token, setToken] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const studioName = studioSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const res = await fetch(`/api/v1/portal/${token}`)
      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        setError(body?.error || "Invalid or expired access link. Please contact the studio.")
        return
      }

      // Store token in sessionStorage for this studio
      sessionStorage.setItem(`portal_token_${studioSlug}`, token)
      router.push(`/portal/${studioSlug}/dashboard`)
    } catch {
      setError("Failed to connect. Please check your internet and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full flex flex-col items-center">

      {/* Studio Header Context */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-primary/20">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{studioName}</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Client Portal Access</p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full bg-card border border-border/60 rounded-xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        <h2 className="text-xl font-bold tracking-tight mb-2">Access Your Portal</h2>
        <p className="text-sm text-muted-foreground mb-6">
          Enter the secure access link sent to your email or WhatsApp by the studio.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-md flex items-start gap-2 text-sm text-red-600">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label>Portal Access Link</Label>
            <Input
              type="text"
              placeholder="abc123-def456-ghi789"
              className="text-sm font-mono tracking-wider"
              value={token}
              onChange={(e) => setToken(e.target.value.trim())}
            />
            <p className="text-xs text-muted-foreground">
              This is the unique token from your invitation link.
            </p>
          </div>

          <Button type="submit" className="w-full font-semibold" disabled={!token || isSubmitting}>
            {isSubmitting ? "Verifying..." : "Access Portal"}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </form>
      </div>

      {/* Privacy Notice */}
      <p className="text-center text-[10px] text-muted-foreground/60 mt-8 max-w-xs">
        By accessing this portal, you agree to the StudioDesk End Client terms of service.
      </p>

    </div>
  )
}
