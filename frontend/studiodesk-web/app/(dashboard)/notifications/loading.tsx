export default function NotificationsLoading() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 md:px-6 py-4 border-b">
        <div className="h-6 w-32 bg-muted rounded-sm animate-pulse" />
        <div className="h-8 w-28 bg-muted rounded-sm animate-pulse" />
      </div>
      <div className="flex items-center gap-2 px-4 md:px-6 py-3 border-b bg-muted/20">
        <div className="h-8 w-56 bg-muted rounded-sm animate-pulse" />
        <div className="h-8 w-28 bg-muted rounded-sm animate-pulse" />
        <div className="h-8 w-36 bg-muted rounded-sm animate-pulse" />
      </div>
      <div className="flex-1 overflow-y-auto">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-start gap-4 px-4 py-3 border-b border-border/40 animate-pulse">
            <span className="mt-2 h-2 w-2 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-3 w-20 bg-muted rounded-sm" />
                <div className="h-3 w-12 bg-muted rounded-sm" />
              </div>
              <div className="h-4 w-3/4 bg-muted rounded-sm" />
              <div className="h-3 w-1/2 bg-muted rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
