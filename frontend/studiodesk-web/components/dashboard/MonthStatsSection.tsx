import { Skeleton } from "@/components/ui/skeleton"

export function MonthStatsSkeleton() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-5 rounded-xl border border-border/60 bg-card space-y-3 shadow-sm">
          <Skeleton className="h-4 w-24 rounded-sm" />
          <Skeleton className="h-8 w-20 rounded-sm" />
          <Skeleton className="h-3 w-32 rounded-sm" />
        </div>
      ))}
    </section>
  )
}

export default async function MonthStatsSection() {
  await new Promise((resolve) => setTimeout(resolve, 800))

  return (
    <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Card 1 */}
      <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between hover:bg-muted/20 transition-colors">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Collected</h2>
        <div className="text-3xl font-bold tabular-nums text-emerald-600 mb-1">₹2.4L</div>
        <div className="font-mono text-xs text-muted-foreground">
          <span className="text-emerald-500 mr-1">↑</span>12% vs last month
        </div>
      </div>

      {/* Card 2 */}
      <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between hover:bg-muted/20 transition-colors">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Pending</h2>
        <div className="text-3xl font-bold tabular-nums text-warning mb-1">₹80K</div>
        <div className="font-mono text-xs text-muted-foreground">
          4 invoices outstanding
        </div>
      </div>

      {/* Card 3 */}
      <div className="p-5 rounded-xl border border-border/60 bg-card shadow-sm flex flex-col justify-between hover:bg-muted/20 transition-colors">
        <h2 className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground font-bold mb-3">Bookings</h2>
        <div className="text-3xl font-bold tabular-nums text-foreground mb-1">12</div>
        <div className="font-mono text-xs text-muted-foreground">
          8 done · 4 upcoming
        </div>
      </div>
    </section>
  )
}
