"use client"

import useSWR from "swr"
import { fetchDashboardOverview } from "@/lib/api"
import { Skeleton } from "@/components/ui/skeleton"
import { AlertCircle, CheckCircle2, FileWarning, ImageIcon, PhoneCall } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const ActionIcon = ({ type }: { type: string }) => {
  switch (type) {
    case "unsigned_contract":
      return <FileWarning className="w-4 h-4 text-muted-foreground" />
    case "gallery_ready":
      return <ImageIcon className="w-4 h-4 text-muted-foreground" />
    case "overdue_followup":
      return <PhoneCall className="w-4 h-4 text-muted-foreground" />
    default:
      return <AlertCircle className="w-4 h-4 text-foreground" />
  }
}

export default function PendingActions() {
  const { data, isLoading } = useSWR("/api/v1/dashboard/overview", fetchDashboardOverview, {
    dedupingInterval: 60000,
  })

  const actions = Array.isArray(data?.attention_items) ? data.attention_items : []

  return (
    <div className="w-full flex flex-col gap-4">
      <h2 className="text-xl font-semibold tracking-tight">Needs Attention</h2>

      <div className="bg-card border border-border/60 rounded-md overflow-hidden">
        {isLoading ? (
          <div className="p-4 flex flex-col gap-4">
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
            <Skeleton className="w-full h-12" />
          </div>
        ) : actions.length > 0 ? (
          <div className="flex flex-col">
            {actions.map((action: any, index: number) => (
              <div
                key={`${action.type}-${index}`}
                className="flex items-center justify-between p-4 border-b border-border/40 last:border-0 hover:bg-muted/10 transition-colors"
              >
                <div className="flex items-start gap-4">
                  <div className="mt-0.5 p-1.5 rounded-sm bg-muted/50 border border-border/40">
                    <ActionIcon type={action.type} />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium">{action.title}</span>
                    {action.subtitle ? (
                      <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">{action.subtitle}</span>
                    ) : null}
                  </div>
                </div>

                {action.action_url ? (
                  <Link href={action.action_url}>
                    <Button variant="outline" size="sm" className="h-7 text-[10px] font-mono uppercase tracking-widest rounded-sm border-border/60 hover:bg-foreground hover:text-background">
                      Open
                    </Button>
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 flex flex-col items-center justify-center text-center border-t border-border/40">
            <div className="w-10 h-10 rounded-sm border border-border/40 bg-muted/5 flex items-center justify-center mb-4">
              <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">All clear</p>
          </div>
        )}
      </div>
    </div>
  )
}
