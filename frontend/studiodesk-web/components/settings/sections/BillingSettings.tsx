"use client"

import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Check, CreditCard, Download, AlertCircle } from "lucide-react"

const usage = [
  { label: "Team Members", used: 14, total: 20, percent: 70 },
  { label: "Active Bookings", used: 42, total: 100, percent: 42 },
  { label: "Gallery Storage", used: 450, total: 1000, suffix: "GB", percent: 45 },
  { label: "Clients", used: 128, total: 500, percent: 25.6 }
]

const history = [
  { date: "01 Mar 2026", plan: "Studio Pro (Monthly)", amount: "₹4,999", method: "Axis Bank **** 4242", status: "Paid", invoice: "INV-2026-03-01" },
  { date: "01 Feb 2026", plan: "Studio Pro (Monthly)", amount: "₹4,999", method: "Axis Bank **** 4242", status: "Paid", invoice: "INV-2026-02-01" },
  { date: "01 Jan 2026", plan: "Studio Pro (Monthly)", amount: "₹4,999", method: "Axis Bank **** 4242", status: "Paid", invoice: "INV-2026-01-01" },
]

export function BillingSettings() {
  return (
    <div className="space-y-2">
      <SettingsSection title="Your Plan" description="Manage your current subscription tier and access limits.">
        <div className="bg-gradient-to-br from-zinc-900 to-zinc-800 text-white rounded-2xl p-6 shadow-lg border border-zinc-700 relative overflow-hidden max-w-2xl">
          {/* Background graphic */}
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-zinc-700/30 rounded-full blur-2xl" />
          <div className="absolute right-20 -bottom-10 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-bold tracking-tight">Studio Pro</h3>
                <p className="text-zinc-400 mt-1">₹4,999 / month</p>
              </div>
              <div className="px-3 py-1 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold tracking-widest uppercase">
                Active
              </div>
            </div>

            <div className="space-y-3 mb-8 text-zinc-300 text-sm">
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Up to 20 team members</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> 1 TB (1000 GB) Gallery Storage</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> GST Indian Invoicing Built-in</div>
              <div className="flex items-center gap-2"><Check className="w-4 h-4 text-primary" /> Face Detection Clustering</div>
              <div className="flex items-center gap-2 text-zinc-500"><AlertCircle className="w-4 h-4" /> WhatsApp Automations (Requires Enterprise)</div>
            </div>

            <div className="flex items-center gap-4 border-t border-zinc-700/50 pt-6">
              <Button className="bg-white text-zinc-900 hover:bg-zinc-100">Upgrade Plan</Button>
              <span className="text-sm text-zinc-400">Renews on 1 April 2026</span>
              <Button variant="link" className="text-xs text-zinc-500 hover:text-red-400 ml-auto px-0">Cancel subscription</Button>
            </div>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Current Usage" description="Platform quotas constrained explicitly against your Studio Pro licensing rules.">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
          {usage.map(u => (
            <div key={u.label} className="bg-card border border-border/60 rounded-xl p-4 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-foreground">{u.label}</span>
                <span className="text-sm text-muted-foreground font-semibold">
                  {u.used} <span className="font-normal text-muted-foreground/60">/ {u.total} {u.suffix}</span>
                </span>
              </div>
              <Progress value={u.percent} className="h-2" />
            </div>
          ))}
        </div>
      </SettingsSection>

      <SettingsSection title="Payment Method" description="Automated billing mapping to Razorpay recurring nodes via India-specific mandate checks.">
        <div className="bg-card border border-border/60 rounded-xl max-w-2xl p-5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-primary" />
            </div>
            <div>
              <p className="font-semibold tracking-tight">Axis Bank Visa ending in 4242</p>
              <p className="text-sm text-muted-foreground mt-0.5">Expires 12/2027</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Button variant="outline" size="sm">Update Card</Button>
            <Button variant="link" size="sm" className="text-xs text-red-500 hover:text-red-600 h-auto p-0">Remove card</Button>
          </div>
        </div>
      </SettingsSection>

      <SettingsSection title="Payment History" description="Financial receipts matching your StudioDesk subscription outputs natively.">
        <div className="max-w-3xl bg-card border border-border/60 rounded-xl shadow-sm overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted/30 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
              <tr>
                <th className="px-5 py-3 border-b border-border/40">Date</th>
                <th className="px-5 py-3 border-b border-border/40">Plan</th>
                <th className="px-5 py-3 border-b border-border/40">Amount</th>
                <th className="px-5 py-3 border-b border-border/40">Status</th>
                <th className="px-5 py-3 border-b border-border/40 text-right">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-muted/10 last:border-0 transition-colors">
                  <td className="px-5 py-4 font-medium">{h.date}</td>
                  <td className="px-5 py-4">{h.plan}</td>
                  <td className="px-5 py-4 font-mono">{h.amount}</td>
                  <td className="px-5 py-4">
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] uppercase font-bold rounded-full">
                      {h.status}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <Button variant="ghost" size="sm" className="h-8 text-primary hover:text-primary"><Download className="w-4 h-4 mr-2" /> PDF</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SettingsSection>
    </div>
  )
}
