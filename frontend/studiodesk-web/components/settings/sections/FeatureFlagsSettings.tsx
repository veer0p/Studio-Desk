"use client"

import * as React from "react"
import { SettingsSection } from "@/components/settings/shared/SettingsSection"
import { Switch } from "@/components/ui/switch"
import { useFeatureFlags, useFeatureFlagsContext } from "@/lib/feature-flags"
import { Loader2, Flag, AlertCircle } from "lucide-react"

const CATEGORY_ORDER = ["Communication", "Gallery", "Contracts", "Analytics", "General"]

export function FeatureFlagsSettings() {
  const { flags, isLoading, error, toggleFlag } = useFeatureFlagsContext()
  const [toggling, setToggling] = React.useState<Record<string, boolean>>({})
  const [toggleError, setToggleError] = React.useState<Record<string, string>>({})

  const handleToggle = React.useCallback(
    async (key: string, isEnabled: boolean) => {
      setToggling((prev) => ({ ...prev, [key]: true }))
      setToggleError((prev) => ({ ...prev, [key]: "" }))
      try {
        await toggleFlag(key, isEnabled)
      } catch (err) {
        setToggleError((prev) => ({
          ...prev,
          [key]: err instanceof Error ? err.message : "Failed to toggle",
        }))
      } finally {
        setToggling((prev) => ({ ...prev, [key]: false }))
      }
    },
    [toggleFlag]
  )

  if (isLoading) {
    return (
      <div className="space-y-2">
        <SettingsSection
          title="Feature Flags"
          description="Loading feature flags..."
        >
          <div className="space-y-3 max-w-3xl">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-4 bg-card border border-border/40 rounded-sm animate-pulse"
              >
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded-sm w-48" />
                  <div className="h-3 bg-muted rounded-sm w-72" />
                </div>
                <div className="h-6 w-11 bg-muted rounded-full ml-4" />
              </div>
            ))}
          </div>
        </SettingsSection>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-2">
        <SettingsSection
          title="Feature Flags"
          description="Unable to load feature flags"
        >
          <div className="bg-red-500/5 border border-red-500/20 rounded-sm p-6 flex flex-col sm:flex-row gap-4 text-red-700 dark:text-red-400 max-w-3xl">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm">Failed to load feature flags</p>
              <p className="text-sm mt-1 text-red-600/80 dark:text-red-400/80">{error.message}</p>
            </div>
          </div>
        </SettingsSection>
      </div>
    )
  }

  if (flags.length === 0) {
    return (
      <div className="space-y-2">
        <SettingsSection
          title="Feature Flags"
          description="No feature flags configured"
        >
          <div className="bg-muted/30 border border-border/40 rounded-sm p-8 flex flex-col items-center gap-3 max-w-3xl">
            <Flag className="w-8 h-8 text-muted-foreground/40" />
            <p className="text-sm text-muted-foreground text-center">
              No feature flags are currently configured. Contact your platform administrator to enable feature flags.
            </p>
          </div>
        </SettingsSection>
      </div>
    )
  }

  // Group flags by category
  const grouped = flags.reduce<Record<string, typeof flags>>((acc, flag) => {
    const cat = flag.category || "General"
    if (!acc[cat]) acc[cat] = []
    acc[cat].push(flag)
    return acc
  }, {})

  // Sort categories by predefined order
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => CATEGORY_ORDER.indexOf(a) - CATEGORY_ORDER.indexOf(b)
  )

  return (
    <div className="space-y-6">
      <SettingsSection
        title="Feature Flags"
        description="Toggle experimental or studio-specific features. Changes are saved immediately and apply to your studio only."
      >
        <div />
      </SettingsSection>

      {sortedCategories.map((category) => (
        <SettingsSection
          key={category}
          title={category}
          description={getCategoryDescription(category)}
        >
          <div className="space-y-3 max-w-3xl">
            {grouped[category].map((flag) => (
              <FeatureFlagRow
                key={flag.key}
                flag={flag}
                isToggling={!!toggling[flag.key]}
                errorMessage={toggleError[flag.key]}
                onToggle={(enabled) => handleToggle(flag.key, enabled)}
              />
            ))}
          </div>
        </SettingsSection>
      ))}
    </div>
  )
}

function FeatureFlagRow({
  flag,
  isToggling,
  errorMessage,
  onToggle,
}: {
  flag: { key: string; label: string; description: string; is_enabled: boolean }
  isToggling: boolean
  errorMessage: string
  onToggle: (enabled: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-4 bg-card border border-border/40 rounded-sm shadow-sm gap-4">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium tracking-tight">{flag.label}</p>
        <p className="text-xs text-muted-foreground mt-0.5 truncate">{flag.description}</p>
        {errorMessage && (
          <p className="text-xs text-red-600 dark:text-red-400 mt-1 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {errorMessage}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {isToggling && (
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        )}
        <Switch
          checked={flag.is_enabled}
          onCheckedChange={onToggle}
          disabled={isToggling}
        />
      </div>
    </div>
  )
}

function getCategoryDescription(category: string): string {
  switch (category) {
    case "Communication":
      return "Control client communication channels and automated messaging."
    case "Gallery":
      return "Manage client gallery capabilities and AI-powered features."
    case "Contracts":
      return "Configure contract templates and digital signature options."
    case "Analytics":
      return "Access advanced reporting and data export capabilities."
    default:
      return "Additional feature toggles for your studio."
  }
}
