"use client"

import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Check, CreditCard, Download, AlertCircle } from "lucide-react"
import useSWR from "swr"
import { fetchBillingInfo, type BillingInfo } from "@/lib/api"

export function BillingSettings() {
  const { data: billing, isLoading, error } = useSWR<BillingInfo>(
    "/api/v1/settings/billing",
    fetchBillingInfo
  )

  if (isLoading) {
    return (
      <div className="space-y-2">
        <SettingsSection title="Your Plan" description="Manage your current subscription tier and access limits.">
          <div className="bg-card border border-border/60 rounded-md p-6 shadow-sm max-w-2xl">
            <Skeleton className="h-6 w-32 mb-2" />
            <Skeleton className="h-4 w-24 mb-6" />
            <div className="space-y-2 mb-8">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-48" />
              ))}
            </div>
            <Skeleton className="h-9 w-32" />
          </div>
        </SettingsSection>
        <SettingsSection title="Current Usage" description="Platform quotas constrained explicitly against your Studio Pro licensing rules.">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </SettingsSection>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <SettingsSection title="Your Plan" description="Manage your current subscription tier and access limits.">
          <div className="bg-card border border-border/60 rounded-md p-6 shadow-sm max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">Failed to load billing information. Please try again later.</p>
          </div>
        </SettingsSection>
      </div>
    )
  }

  const features = Array.isArray(billing?.features) 
    ? billing.features 
    : []

  return (
    <div className="space-y-2">
      <SettingsSection title="Your Plan" description="Manage your current subscription tier and access limits.">
        <div className="bg-card border border-border/60 rounded-md p-6 shadow-sm max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">{billing?.plan_name || "Studio Pro"}</h3>
              <p className="text-sm text-muted-foreground mt-1 font-mono">
                ₹{billing?.price_monthly?.toLocaleString("en-IN") || (4999)} / month
              </p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 border border-border/60 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-sm bg-foreground/80" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">
                {billing?.subscription_status || "Active"}
              </span>
            </div>
          </div>

          <div className="space-y-2 mb-8 text-sm text-muted-foreground">
            {features.length > 0 ? (
              features.map((feature: string, index: number) => (
                <div key={index} className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 opacity-70" />
                  <span>{feature}</span>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 opacity-70" /> Up to {billing?.max_team_members || 20} team members</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 opacity-70" /> {billing?.storage_limit_gb || 1000} GB Gallery Storage</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 opacity-70" /> GST Indian Invoicing Built-in</div>
                <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 opacity-70" /> Face Detection Clustering</div>
              </>
            )}
          </div>

          <div className="flex items-center gap-4 border-t border-border/40 pt-6">
            <Button>Upgrade Plan</Button>
            {billing?.trial_ends_at && (
              <span className="text-xs text-muted-foreground font-mono">
                Trial ends on {new Date(billing.trial_ends_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            )}
            <Button variant="link" className="text-xs text-muted-foreground hover:text-foreground ml-auto px-0">Cancel subscription</Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Current Usage" description="Platform quotas constrained explicitly against your Studio Pro licensing rules.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <UsageCard 
            label="Team Members" 
            used={billing?.current_member_count || 0} 
            total={billing?.max_team_members || 20} 
          />
          <UsageCard 
            label="Gallery Storage" 
            used={billing?.storage_used_gb || 0} 
            total={billing?.storage_limit_gb || 1000} 
            suffix="GB" 
          />
        </div>
      </SettingsSection>

      <SettingsSection title="Payment Method" description="Automated billing mapping to Razorpay recurring nodes via India-specific mandate checks.">
        <div className="bg-card border border-border/60 rounded-md max-w-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-sm">
              <CreditCard className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-semibold tracking-tight">Payment method not configured</p>
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">Configure Razorpay in integrations</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button variant="outline" size="sm">Configure</Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Payment History" description="Financial receipts matching your StudioDesk subscription outputs natively.">
        <div className="max-w-3xl bg-card border border-border/60 rounded-md shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/30 text-[10px] font-semibold text-muted-foreground uppercase tracking-widest">
              <tr>
                <th className="px-5 py-3 border-b border-border/40">Date</th>
                <th className="px-5 py-3 border-b border-border/40">Plan</th>
                <th className="px-5 py-3 border-b border-border/40">Amount</th>
                <th className="px-5 py-3 border-b border-border/40">Status</th>
                <th className="px-5 py-3 border-b border-border/40 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={5} className="px-5 py-12 text-center text-muted-foreground">
                  <p className="text-sm">Payment history will appear here once your subscription is active.</p>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </SettingsSection>
    </div>
  )
}

function UsageCard({ label, used, total, suffix }: { label: string; used: number; total: number; suffix?: string }) {
  const percent = Math.round((used / total) * 100)
  return (
    <div className="bg-card border border-border/60 rounded-md p-4">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <span className="text-xs text-muted-foreground font-mono">
          {used} / {total} {suffix ?? ""}
        </span>
      </div>
      <Progress value={percent} className="h-1.5" />
    </div>
  )
}
