export function AnalyticsSkeleton() {
  return (
    <div className="w-full h-full min-h-[220px] flex items-end justify-between gap-2 p-2 opacity-50">
      {[40, 70, 45, 90, 65, 30, 85, 50, 75].map((h, i) => (
        <div 
          key={i} 
          className="w-full bg-muted/60 rounded-t-sm animate-pulse" 
          style={{ height: `${h}%`, animationDelay: `${i * 0.1}s` }} 
        />
      ))}
    </div>
  )
}
