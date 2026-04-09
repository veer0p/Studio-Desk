"use client"

import { useState } from "react"
import { Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { verifyClientPin } from "@/lib/api"

export function GalleryAccessGate({ slug, children }: { slug: string, children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [pin, setPin] = useState(["", "", "", ""])
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const handlePinChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (!/^\d*$/.test(value)) return

    setError("")
    const newPin = [...pin]
    newPin[index] = value
    setPin(newPin)

    if (value && index < 3) {
      document.getElementById(`pin-${index + 1}`)?.focus()
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !pin[index] && index > 0) {
      document.getElementById(`pin-${index - 1}`)?.focus()
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const entered = pin.join("")
    if (entered.length < 4) return

    setIsLoading(true)
    setError("")
    try {
      await verifyClientPin(slug, entered)
      setIsAuthenticated(true)
    } catch (err) {
      setError("Incorrect PIN. Please try again.")
      setPin(["", "", "", ""])
      document.getElementById(`pin-0`)?.focus()
    } finally {
      setIsLoading(false)
    }
  }

  if (isAuthenticated) {
    return <>{children}</>
  }

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm text-center space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gallery Access</h1>
          <p className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mt-2">Protected Content</p>
        </div>

        <div className="bg-card p-8 rounded-md shadow-sm border border-border/60">
          <div className="w-10 h-10 bg-muted border border-border/40 rounded-sm flex items-center justify-center mx-auto mb-6">
            <Lock className="w-4 h-4 text-muted-foreground" />
          </div>

          <h2 className="font-bold text-lg mb-1 tracking-tight">Enter Gallery PIN</h2>
          <p className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground mb-6">PIN Protected Gallery</p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex justify-center gap-3">
              {pin.map((digit, idx) => (
                <input
                  key={idx}
                  id={`pin-${idx}`}
                  type="text"
                  inputMode="numeric"
                  value={digit}
                  onChange={(e) => handlePinChange(idx, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(idx, e)}
                  className={`w-14 h-16 text-center text-2xl font-mono font-bold rounded-md border-2 transition-colors ${
                    error ? 'border-red-500 bg-red-500/5' :
                    digit ? 'border-primary bg-primary/5' : 'border-border/60 bg-muted/20'
                  } focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20`}
                />
              ))}
            </div>

            {error && <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-red-500">{error}</p>}

            <Button
              type="submit"
              className="w-full h-12 rounded-md text-[11px] font-mono font-bold tracking-widest uppercase"
              disabled={pin.join("").length < 4 || isLoading}
            >
              {isLoading ? "Verifying..." : "Unlock Gallery"}
            </Button>
          </form>
        </div>

        <p className="text-xs text-muted-foreground">Powered by StudioDesk</p>
      </div>
    </div>
  )
}
