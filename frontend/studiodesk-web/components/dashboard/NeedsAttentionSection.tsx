import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { ROUTES } from "@/lib/constants/routes"

export function NeedsAttentionSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 mb-3 pl-1">
        <div className="p-1 rounded-sm bg-muted/10 border-border/40 border">
          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Needs Attention</h2>
      </div>
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="p-4 rounded-xl border border-border/60 bg-card flex justify-between items-center shadow-sm">
            <div className="flex items-start gap-3">
              <Skeleton className="w-2 h-2 mt-1.5 rounded-none" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-48 rounded-sm" />
                <Skeleton className="h-3 w-32 rounded-sm" />
              </div>
            </div>
            <Skeleton className="h-4 w-12 rounded-sm" />
          </div>
        ))}
      </div>
    </section>
  )
}

const ATTENTION_ITEMS = [
  {
    id: "att-1",
    type: "overdue",
    title: "3 invoices overdue",
    subtitle: "Oldest: 5 days ago",
    colorClass: "bg-red-500",
    textClass: "text-red-500",
    link: ROUTES.FINANCE
  },
  {
    id: "att-2",
    type: "action",
    title: "2 contracts pending",
    subtitle: "Sent 3 days ago",
    colorClass: "bg-amber-500",
    textClass: "text-amber-500",
    link: ROUTES.BOOKINGS
  },
  {
    id: "att-3",
    type: "opportunity",
    title: "1 gallery ready to publish",
    subtitle: "Sharma Wedding · 450 photos",
    colorClass: "bg-blue-500",
    textClass: "text-blue-500",
    link: ROUTES.GALLERY
  }
];

export default async function NeedsAttentionSection() {
  await new Promise((resolve) => setTimeout(resolve, 600))
  const items = ATTENTION_ITEMS;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 mb-3 pl-1">
        <div className="p-1 rounded-sm bg-muted/10 border-border/40 border">
          <AlertCircle className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Needs Attention</h2>
        <span className="text-[10px] font-mono font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-sm">
          {items.length}
        </span>
      </div>
      
      {items.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm pl-1">
          <CheckCircle className="w-4 h-4" />
          <span>You&apos;re all caught up</span>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Link key={item.id} href={item.link}>
              <div className="p-4 rounded-xl border border-border/60 bg-card hover:bg-muted/20 transition-colors shadow-sm cursor-pointer flex justify-between items-center group">
                <div className="flex items-start gap-3">
                  <div className={`w-1.5 h-1.5 mt-1.5 rounded-sm shrink-0 ${item.colorClass}`} />
                  <div>
                    <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">{item.title}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{item.subtitle}</p>
                  </div>
                </div>
                <div className={`text-xs font-medium shrink-0 pl-4 ${item.textClass} opacity-80 group-hover:opacity-100 transition-opacity`}>
                  Resolve &rarr;
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </section>
  )
}
