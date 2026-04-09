import { Skeleton } from "@/components/ui/skeleton"

export function GreetingSkeleton() {
  return (
    <div className="flex flex-row justify-between items-center gap-4 w-full">
      <div className="flex items-center gap-3">
        <Skeleton className="h-6 w-32 rounded-sm" />
      </div>
      <Skeleton className="h-6 w-24 hidden sm:block rounded-sm" />
    </div>
  )
}

export default async function GreetingSection({ userName }: { userName?: string }) {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500))

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening'

  const dateStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date())

  return (
    <div className="flex items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold tracking-tight">{greeting}, {userName || "User"}</h1>
        <span className="hidden md:block w-px h-5 bg-border/50"></span>
        <p className="hidden md:block font-mono text-muted-foreground text-xs mt-0.5">{dateStr}</p>
      </div>
      <div className="hidden sm:flex border border-border/60 rounded-sm px-2.5 py-1 items-center bg-muted/10">
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Studio Plan</span>
      </div>
    </div>
  )
}
