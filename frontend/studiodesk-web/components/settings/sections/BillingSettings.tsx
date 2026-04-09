"use client"

import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Check, CreditCard, Download, AlertCircle } from "lucide-react"

export function BillingSettings() {
  return (
    <div className="space-y-2">
      <SettingsSection title="Your Plan" description="Manage your current subscription tier and access limits.">
        <div className="bg-card border border-border/60 rounded-md p-6 shadow-sm max-w-2xl">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold tracking-tight">Studio Pro</h3>
              <p className="text-sm text-muted-foreground mt-1 font-mono">₹4,999 / month</p>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 border border-border/60 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-sm bg-foreground/80" />
              <span className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground">Active</span>
            </div>
          </div>

          <div className="space-y-2 mb-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 opacity-70" /> Up to 20 team members</div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 opacity-70" /> 1 TB (1000 GB) Gallery Storage</div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 opacity-70" /> GST Indian Invoicing Built-in</div>
            <div className="flex items-center gap-2"><Check className="w-3.5 h-3.5 opacity-70" /> Face Detection Clustering</div>
            <div className="flex items-center gap-2 opacity-50"><AlertCircle className="w-3.5 h-3.5" /> WhatsApp Automations (Requires Enterprise)</div>
          </div>

          <div className="flex items-center gap-4 border-t border-border/40 pt-6">
            <Button>Upgrade Plan</Button>
            <span className="text-xs text-muted-foreground font-mono">Renews on 1 April 2026</span>
            <Button variant="link" className="text-xs text-muted-foreground hover:text-foreground ml-auto px-0">Cancel subscription</Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Current Usage" description="Platform quotas constrained explicitly against your Studio Pro licensing rules.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          <UsageCard label="Team Members" used={14} total={20} />
          <UsageCard label="Active Bookings" used={42} total={100} />
          <UsageCard label="Gallery Storage" used={450} total={1000} suffix="GB" />
          <UsageCard label="Clients" used={128} total={500} />
        </div>
      </SettingsSection>

      <SettingsSection title="Payment Method" description="Automated billing mapping to Razorpay recurring nodes via India-specific mandate checks.">
        <div className="bg-card border border-border/60 rounded-md max-w-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-muted rounded-sm">
              <CreditCard className="w-5 h-5 text-foreground" />
            </div>
            <div>
              <p className="font-semibold tracking-tight">Axis Bank Visa ending in 4242</p>
              <p className="text-sm text-muted-foreground mt-0.5 font-mono">Expires 12/2027</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button variant="outline" size="sm">Update Card</Button>
            <Button variant="link" size="sm" className="text-xs text-muted-foreground hover:text-foreground h-auto p-0">Remove card</Button>
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
