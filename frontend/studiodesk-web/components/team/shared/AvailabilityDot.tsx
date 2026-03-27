"use client"

export function AvailabilityDot({ status }: { status: "available" | "partial" | "unavailable" }) {
  const colors = {
    available: "bg-emerald-500 ring-emerald-500/20",
    partial: "bg-amber-500 ring-amber-500/20",
    unavailable: "bg-slate-400 ring-slate-400/20"
  }
  
  const [bgClass, ringClass] = colors[status].split(" ")
  
  return (
    <span className="relative flex h-3 w-3">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-40 ${bgClass}`}></span>
      <span className={`relative inline-flex rounded-full h-3 w-3 border border-white/20 shadow-sm ${bgClass}`}></span>
    </span>
  )
}
