export const roleColors: Record<string, string> = {
  Owner: "bg-indigo-500/10 text-indigo-600 border-indigo-500/20",
  Admin: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  Photographer: "bg-violet-500/10 text-violet-600 border-violet-500/20",
  Videographer: "bg-rose-500/10 text-rose-600 border-rose-500/20",
  Editor: "bg-teal-500/10 text-teal-600 border-teal-500/20",
  "Drone Operator": "bg-amber-500/10 text-amber-600 border-amber-500/20",
  Assistant: "bg-slate-500/10 text-slate-600 border-slate-500/20",
  Freelancer: "bg-orange-500/10 text-orange-600 border-orange-500/20",
}

export function RoleBadge({ role, className = "" }: { role: string; className?: string }) {
  const colorClass = roleColors[role] || roleColors.Assistant
  return (
    <span className={`px-2 py-0.5 rounded-full text-[10px] items-center inline-flex font-bold tracking-wider uppercase border ${colorClass} ${className}`}>
      {role}
    </span>
  )
}
