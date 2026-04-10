"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Play, Activity, Settings, BarChart3, AlertCircle, CheckCircle2 } from "lucide-react"
import { toast } from "sonner"

type AutomationTemplate = {
  id: string
  name: string
  trigger: string
  enabled: boolean
  last_run?: string
  success_count: number
  failure_count: number
}

type AutomationStats = {
  total_runs: number
  successful: number
  failed: number
  avg_response_time_ms: number
}

export default function AutomationsPage() {
  const { mutate } = useSWRConfig()
  const [testingId, setTestingId] = useState<string | null>(null)

  const { data: settings, isLoading: loadingSettings } = useSWR("/api/v1/automations/settings")
  const { data: stats, isLoading: loadingStats } = useSWR("/api/v1/automations/stats")
  const { data: templates, isLoading } = useSWR("/api/v1/automations/templates")
  const { data: log } = useSWR("/api/v1/automations/log")

  const automationList: AutomationTemplate[] = templates?.data || []
  const automationStats: AutomationStats = stats?.data || {}
  const settingsData = settings?.data || {}

  const handleToggle = async (id: string, enabled: boolean) => {
    try {
      const res = await fetch(`/api/v1/automations/settings`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, enabled }),
      })
      if (!res.ok) throw new Error("Failed to update automation")
      toast.success(`Automation ${enabled ? "enabled" : "disabled"}`)
      mutate("/api/v1/automations/templates")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update")
    }
  }

  const handleTest = async (id: string) => {
    setTestingId(id)
    try {
      const res = await fetch("/api/v1/automations/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ automation_id: id }),
      })
      if (!res.ok) throw new Error("Test failed")
      toast.success("Automation triggered successfully")
      mutate("/api/v1/automations/log")
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Test failed")
    } finally {
      setTestingId(null)
    }
  }

  if (isLoading || loadingSettings || loadingStats) {
    return (
      <div className="p-6 md:p-8 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-md" />)}
        </div>
        <Skeleton className="h-64 w-full rounded-md" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Automations</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage automated workflows and triggers</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border/60 rounded-md p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <BarChart3 className="w-4 h-4" /> Total Runs
          </div>
          <p className="text-2xl font-bold">{automationStats.total_runs || 0}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-md p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Successful
          </div>
          <p className="text-2xl font-bold text-emerald-600">{automationStats.successful || 0}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-md p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <AlertCircle className="w-4 h-4 text-red-600" /> Failed
          </div>
          <p className="text-2xl font-bold text-red-600">{automationStats.failed || 0}</p>
        </div>
        <div className="bg-card border border-border/60 rounded-md p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <Activity className="w-4 h-4" /> Avg Response
          </div>
          <p className="text-2xl font-bold">{automationStats.avg_response_time_ms || 0}ms</p>
        </div>
      </div>

      {/* Automations List */}
      <div className="bg-card border border-border/60 rounded-md">
        <div className="px-6 py-4 border-b border-border/60 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Automation Templates</h2>
        </div>
        <div className="divide-y divide-border/60">
          {automationList.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Settings className="w-12 h-12 mx-auto mb-4 opacity-30" />
              <p className="font-medium text-foreground mb-1">No automations configured</p>
              <p className="text-sm">Set up automated workflows to save time.</p>
            </div>
          ) : (
            automationList.map((auto) => (
              <div key={auto.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-md bg-muted flex items-center justify-center">
                    <Settings className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="font-medium">{auto.name}</h3>
                    <p className="text-sm text-muted-foreground">Trigger: {auto.trigger}</p>
                  </div>
                  <Badge variant={auto.enabled ? "default" : "secondary"}>
                    {auto.enabled ? "Active" : "Disabled"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right text-sm text-muted-foreground">
                    <p>{auto.success_count} successful</p>
                    {auto.last_run && <p>Last: {new Date(auto.last_run).toLocaleDateString()}</p>}
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={auto.enabled}
                      onCheckedChange={(checked) => handleToggle(auto.id, checked)}
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTest(auto.id)}
                      disabled={testingId === auto.id}
                    >
                      <Play className="w-3 h-3 mr-1" />
                      {testingId === auto.id ? "Testing..." : "Test"}
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Log */}
      {log?.data?.length > 0 && (
        <div className="bg-card border border-border/60 rounded-md">
          <div className="px-6 py-4 border-b border-border/60">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border/60 max-h-64 overflow-y-auto">
            {log.data.slice(0, 10).map((entry: any, i: number) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between text-sm">
                <div>
                  <span className="font-medium">{entry.automation_name}</span>
                  <span className="text-muted-foreground ml-2">→ {entry.target}</span>
                </div>
                <div className="text-muted-foreground">
                  {new Date(entry.created_at).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
