export const roleColors: Record<string, string> = {
  Owner: "bg-foreground text-background border-foreground",
  Admin: "bg-muted text-foreground border-border",
  Photographer: "bg-muted text-foreground border-border",
  Videographer: "bg-muted text-foreground border-border",
  Editor: "bg-muted text-foreground border-border",
  "Drone Operator": "bg-muted text-foreground border-border",
  Assistant: "bg-muted text-foreground border-border",
  Freelancer: "bg-muted text-foreground border-border",
}

export function RoleBadge({ role, className = "" }: { role: string; className?: string }) {
  const colorClass = roleColors[role] || roleColors.Assistant
  return (
    <span className={`px-2 py-1 rounded-sm text-[9px] items-center inline-flex font-mono font-bold tracking-widest uppercase border ${colorClass} ${className}`}>
      {role}
    </span>
  )
}
