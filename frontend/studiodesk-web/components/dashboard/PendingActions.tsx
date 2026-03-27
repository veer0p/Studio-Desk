"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, FileWarning, CheckCircle2, AlertTriangle, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const ActionIcon = ({ type, impact }: { type: string, impact: string }) => {
  const colorClass = impact === "high" ? "text-rose-500" : "text-amber-500"
  
  switch(type) {
    case "unsigned_contracts": return <FileWarning className={`w-5 h-5 ${colorClass}`} />
    case "overdue_payments": return <AlertCircle className={`w-5 h-5 ${colorClass}`} />
    case "team_conflicts": return <Users className={`w-5 h-5 ${colorClass}`} />
    case "deliveries_overdue": return <AlertTriangle className={`w-5 h-5 ${colorClass}`} />
    default: return <AlertCircle className={`w-5 h-5 ${colorClass}`} />
  }
}

export default function PendingActions() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/actions", fetcher, { dedupingInterval: 60000 })

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Needs Attention</h2>

      <div className="bg-card border border-border/60 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-4 flex flex-col gap-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        ) : data?.actions?.length > 0 ? (
          <div className="flex flex-col">
            {data.actions.map((action: any, i: number) => (
              <div 
                key={i} 
                className="flex items-center justify-between p-4 border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    <ActionIcon type={action.type} impact={action.impact} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{action.title}</span>
                    {action.extra && (
                      <span className="text-xs text-muted-foreground">{action.extra}</span>
                    )}
                  </div>
                </div>
                {action.ctaLink ? (
                  <Link href={action.ctaLink}>
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      {action.ctaText}
                    </Button>
                  </Link>
                ) : (
                  <Button variant="ghost" size="sm" className="h-8 text-xs">
                    {action.ctaText}
                  </Button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="text-sm font-medium text-foreground">All clear</p>
            <p className="text-xs text-muted-foreground">Nothing needs your attention right now.</p>
          </div>
        )}
      </div>
    </div>
  )
}
