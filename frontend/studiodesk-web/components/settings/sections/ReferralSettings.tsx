"use client"

import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Copy, RefreshCw, Gift, Users, Coins, CheckCircle2 } from "lucide-react"
import useSWR from "swr"
import { fetchReferralInfo, generateReferralCode, type ReferralInfo } from "@/lib/api"
import { useState, useCallback } from "react"
import { toast } from "sonner"

export function ReferralSettings() {
  const { data: referral, isLoading, error, mutate } = useSWR<ReferralInfo>(
    "/api/v1/referral",
    fetchReferralInfo
  )
  const [generating, setGenerating] = useState(false)

  const handleGenerate = useCallback(async () => {
    setGenerating(true)
    try {
      await generateReferralCode()
      await mutate()
      toast.success("New referral code generated")
    } catch {
      toast.error("Failed to generate referral code")
    } finally {
      setGenerating(false)
    }
  }, [mutate])

  const handleCopy = useCallback((text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast.success(`${label} copied to clipboard`)
    }).catch(() => {
      toast.error("Failed to copy")
    })
  }, [])

  if (isLoading) {
    return (
      <div className="space-y-2">
        <SettingsSection title="Referral Program" description="Share your studio with other creators and earn credits for every successful referral.">
          <div className="bg-card border border-border/60 rounded-md p-6 shadow-sm max-w-2xl">
            <Skeleton className="h-5 w-40 mb-4" />
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-9 w-20" />
            </div>
            <Skeleton className="h-5 w-48 mb-4" />
            <div className="flex items-center gap-3 mb-6">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-9 w-20" />
            </div>
          </div>
        </SettingsSection>
        <SettingsSection title="Your Stats" description="Track how many studios you have referred and the credits you have earned.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        </SettingsSection>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <SettingsSection title="Referral Program" description="Share your studio with other creators and earn credits for every successful referral.">
          <div className="bg-card border border-border/60 rounded-md p-6 shadow-sm max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">Failed to load referral information. Please try again later.</p>
          </div>
        </SettingsSection>
      </div>
    )
  }

  const referralCode = referral?.referral_code
  const referralLink = referralCode
    ? `${typeof window !== "undefined" ? window.location.origin : ""}/signup?ref=${referralCode}`
    : ""

  return (
    <div className="space-y-2">
      <SettingsSection title="Referral Program" description="Share your studio with other creators and earn credits for every successful referral.">
        <div className="bg-card border border-border/60 rounded-md p-6 shadow-sm max-w-2xl">
          {!referralCode ? (
            <div className="text-center py-8">
              <Gift className="w-10 h-10 text-muted-foreground mx-auto mb-4 opacity-60" />
              <h3 className="text-lg font-semibold tracking-tight mb-2">No referral code yet</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Generate your unique referral code to start earning credits.
              </p>
              <Button onClick={handleGenerate} disabled={generating}>
                {generating ? (
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Gift className="w-4 h-4 mr-2" />
                )}
                {generating ? "Generating..." : "Generate Referral Code"}
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
                  Your Referral Code
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted border border-border/40 rounded-sm px-4 py-3 font-mono text-lg tracking-widest text-center">
                    {referralCode}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(referralCode, "Code")}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="mb-6">
                <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">
                  Referral Link
                </label>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-muted border border-border/40 rounded-sm px-4 py-2.5 font-mono text-xs truncate">
                    {referralLink}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(referralLink, "Link")}
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>

              <div className="flex items-center justify-between border-t border-border/40 pt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  disabled={generating}
                  className="text-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${generating ? "animate-spin" : ""}`} />
                  Generate New Code
                </Button>
              </div>
            </>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="Your Stats" description="Track how many studios you have referred and the credits you have earned.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <StatCard
            icon={<Users className="w-5 h-5" />}
            label="Total Referrals"
            value={referral?.total_referrals ?? 0}
          />
          <StatCard
            icon={<Coins className="w-5 h-5" />}
            label="Credits Earned"
            value={referral?.total_credits_earned ?? 0}
            suffix="credits"
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Redemption History" description="Studios that signed up using your referral code.">
        <div className="max-w-3xl bg-card border border-border/60 rounded-md shadow-sm overflow-x-auto">
          {!referral?.redemptions || referral.redemptions.length === 0 ? (
            <div className="px-5 py-12 text-center text-muted-foreground">
              <Gift className="w-8 h-8 mx-auto mb-3 opacity-40" />
              <p className="text-sm">No redemptions yet. Share your code to get started!</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left whitespace-nowrap">
              <thead className="bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
                <tr>
                  <th className="px-5 py-3 border-b border-border/40">Date</th>
                  <th className="px-5 py-3 border-b border-border/40">Studio ID</th>
                  <th className="px-5 py-3 border-b border-border/40 text-right">Status</th>
                </tr>
              </thead>
              <tbody>
                {referral.redemptions.map((r) => (
                  <tr key={r.id} className="border-b border-border/20 last:border-b-0">
                    <td className="px-5 py-3 font-mono text-xs">
                      {new Date(r.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-muted-foreground">
                      {r.referred_studio_id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-3 text-right">
                      {r.rewarded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-mono tracking-widest uppercase text-green-600 dark:text-green-400">
                          <CheckCircle2 className="w-3 h-3" /> Rewarded
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">
                          Pending
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </SettingsSection>

      <SettingsSection title="How It Works" description="">
        <div className="bg-card border border-border/60 rounded-md p-6 shadow-sm max-w-2xl space-y-4">
          <HowItWorksStep
            step="1"
            title="Share your code"
            description="Give your unique referral code to other studio owners or share the referral link."
          />
          <HowItWorksStep
            step="2"
            title="They sign up"
            description="When someone signs up using your code, the referral is automatically tracked."
          />
          <HowItWorksStep
            step="3"
            title="Earn credits"
            description={`You earn ${referral?.reward_value ?? 500} credits for every successful referral. Credits are applied automatically.`}
          />
        </div>
      </SettingsSection>
    </div>
  )
}

function StatCard({ icon, label, value, suffix }: { icon: React.ReactNode; label: string; value: number | string; suffix?: string }) {
  return (
    <div className="bg-card border border-border/60 rounded-md p-4 flex items-center gap-4">
      <div className="p-2.5 bg-muted rounded-sm text-foreground">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">{label}</p>
        <p className="text-xl font-semibold tracking-tight">
          {typeof value === "number" ? value.toLocaleString("en-IN") : value}
          {suffix && <span className="text-sm font-normal text-muted-foreground ml-1">{suffix}</span>}
        </p>
      </div>
    </div>
  )
}

function HowItWorksStep({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <div className="flex items-start gap-4">
      <div className="flex items-center justify-center w-7 h-7 border border-border/60 rounded-sm shrink-0">
        <span className="text-xs font-mono font-bold">{step}</span>
      </div>
      <div>
        <h4 className="text-sm font-semibold tracking-tight">{title}</h4>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
    </div>
  )
}
