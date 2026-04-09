"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, CheckCircle2, ChevronDown, Save, Calendar, Banknote } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RoleBadge } from "@/components/team/shared/RoleBadge"
import { EditMemberSheet } from "./EditMemberSheet"
import { Switch } from "@/components/ui/switch"

export function MemberDetail({ id }: { id: string }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"overview"|"shoots"|"payouts"|"availability">("overview")

  // Mock
  const m = {
    id, name: "Vikram Singh", initials: "VS", colorHash: "#3b82f6",
    role: "Videographer", designation: "Cinematic Film Director",
    phone: "+918765432109", email: "vikram@example.com",
    isActive: true, totalShoots: 42, shootsThisMonth: 8,
    totalPaid: 450000, pendingPayout: 45000,
    upi: "viksam@okicici", pan: "ABCDE1234F"
  }

  const formatINR = (val: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(val)

  return (
    <div className="flex-1 overflow-auto flex flex-col bg-background">
      
      {/* Sticky Header */}
      <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md border-b border-border/40 p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <Button variant="ghost" size="icon" className="shrink-0 rounded-full h-10 w-10 bg-muted/20" onClick={() => router.push("/team")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-xl" style={{ backgroundColor: m.colorHash }}>
              {m.initials}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold tracking-tight">{m.name}</h1>
                <RoleBadge role={m.role} />
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{m.designation} • {m.phone}</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 mr-4 border-r border-border/40 pr-6">
            <span className="text-sm font-medium">Active</span>
            <Switch checked={m.isActive} />
          </div>

          <EditMemberSheet member={m} />
          <Button variant="outline" className="h-9 hidden sm:inline-flex"><Banknote className="w-4 h-4 mr-2" /> Record Payout</Button>
          <Button className="h-9 hidden sm:inline-flex"><Calendar className="w-4 h-4 mr-2" /> Assign Shoot</Button>
          {/* Mobile: icon-only buttons */}
          <Button variant="outline" size="icon" className="h-9 w-9 sm:hidden"><Banknote className="w-4 h-4" /></Button>
          <Button size="icon" className="h-9 w-9 sm:hidden"><Calendar className="w-4 h-4" /></Button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="bg-muted/10 border-b border-border/40 px-4 sm:px-6 py-4 grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Shoots</p>
          <p className="text-xl font-semibold">{m.totalShoots}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Shoots This Month</p>
          <p className="text-xl font-semibold">{m.shootsThisMonth}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Total Paid Out</p>
          <p className="text-xl font-semibold">{formatINR(m.totalPaid)}</p>
        </div>
        <div>
          <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Pending Payout</p>
          <p className="text-xl font-bold text-amber-600">{formatINR(m.pendingPayout)}</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-6 px-6 border-b border-border/40 bg-background pt-4">
        {(["overview", "shoots", "payouts", "availability"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 pt-1 text-sm font-medium capitalize transition-colors border-b-2 ${activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8 bg-muted/5 flex-1 w-full max-w-7xl mx-auto">
        
        {activeTab === "overview" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="space-y-6 lg:col-span-2">
              {/* Financial Bank Details */}
              <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-lg">Bank & UPI Details</h3>
                  <Button variant="secondary" size="sm" className="h-8"><Save className="w-3.5 h-3.5 mr-1.5" /> Save</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">UPI ID</label>
                      <input type="text" defaultValue={m.upi} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Bank Name</label>
                      <input type="text" placeholder="HDFC Bank" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Account Name</label>
                      <input type="text" placeholder="Vikram Singh" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Account Number</label>
                      <input type="text" placeholder="XXXX XXXX 1234" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">IFSC Code</label>
                      <input type="text" placeholder="HDFC0001234" className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">PAN Number (TDS)</label>
                      <input type="text" defaultValue={m.pan} className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {/* Equipment log */}
              <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-base mb-4">Equipment Logs</h3>
                <textarea 
                  className="w-full min-h-[120px] rounded-md border border-input p-3 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring" 
                  placeholder="e.g. Sony A7SIII, FX3, DJI Mavic 3 Cine..." 
                  defaultValue="Sony FX3 (Primary)
Sony A7SIII (B-Cam)
Ronin RS3 Pro
Zeiss CP.3 Primes" 
                />
              </div>

              {/* Specializations mapping */}
              <div className="bg-card border border-border/60 rounded-xl p-6 shadow-sm">
                <h3 className="font-semibold text-base mb-4">Specializations</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">Cinematography</span>
                  <span className="px-3 py-1 bg-muted rounded-full text-xs font-medium">Wedding Films</span>
                  <span className="px-3 py-1 border border-dashed border-border/60 rounded-full text-xs font-medium cursor-pointer hover:bg-muted">+ Add Tag</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab !== "overview" && (
          <div className="flex flex-col items-center justify-center p-24 bg-card rounded-xl border border-border/40 border-dashed text-muted-foreground">
            <h2 className="text-lg font-medium text-foreground mb-2">Tab content isolated</h2>
            <p className="text-sm max-w-sm text-center">Shoots, Payouts, and Availability tabs will inherit from standard global list components via deep linking.</p>
          </div>
        )}

      </div>
    </div>
  )
}
