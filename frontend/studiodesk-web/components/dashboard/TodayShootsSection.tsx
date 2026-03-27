import { Skeleton } from "@/components/ui/skeleton"
import { CheckCircle, MessageCircle, Clock } from "lucide-react"

export function TodayShootsSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 mb-3 pl-1">
        <div className="p-1 rounded-sm bg-muted/10 border-border/40 border">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Today's Shoots</h2>
      </div>
      <div className="flex overflow-x-auto gap-4 pb-4 [&::-webkit-scrollbar]:hidden">
        {[1, 2].map((i) => (
          <div key={i} className="min-w-[280px] sm:min-w-[320px] rounded-xl border border-border/60 p-4 shrink-0 space-y-3 bg-card shadow-sm">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-20 rounded-sm" />
              <Skeleton className="h-4 w-12 rounded-sm" />
            </div>
            <div className="space-y-1">
              <Skeleton className="h-5 w-40 rounded-sm" />
              <Skeleton className="h-4 w-24 rounded-sm" />
            </div>
            <div className="flex justify-between items-center pt-2">
              <Skeleton className="h-4 w-32 rounded-sm" />
              <Skeleton className="h-8 w-20 rounded-sm" />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

// Temporary placeholder data
const TODAY_SHOOTS = [
  {
    id: "1",
    eventType: "Wedding",
    time: "09:00 AM",
    title: "Sharma Wedding Day 1",
    clientName: "Rahul & Priya",
    venue: "Taj Lands End, Mumbai",
    color: "#E11D48", // Rose 600
    phone: "9876543210"
  },
  {
    id: "2",
    eventType: "Pre-Wedding",
    time: "04:30 PM",
    title: "Patel Pre-Wedding Shoot",
    clientName: "Amit Patel",
    venue: "Sanjay Gandhi National Park",
    color: "#0EA5E9", // Sky 500
    phone: "9876543211"
  }
];

export default async function TodayShootsSection() {
  await new Promise((resolve) => setTimeout(resolve, 700))
  const shoots = TODAY_SHOOTS;

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 mb-3 pl-1">
        <div className="p-1 rounded-sm bg-muted/10 border-border/40 border">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Today's Shoots</h2>
        <span className="text-[10px] font-mono font-medium text-muted-foreground bg-muted/50 px-1.5 py-0.5 rounded-sm">
          {shoots.length}
        </span>
      </div>
      
      {shoots.length === 0 ? (
        <div className="flex items-center gap-2 text-muted-foreground text-sm pl-1">
          <CheckCircle className="w-4 h-4" />
          <span>No shoots today</span>
        </div>
      ) : (
        <div className="flex overflow-x-auto gap-4 pb-4 [&::-webkit-scrollbar]:hidden -mx-4 px-4 sm:mx-0 sm:px-0">
          {shoots.map((shoot) => (
            <div 
              key={shoot.id} 
              className="group relative flex flex-col min-w-[280px] sm:min-w-[320px] rounded-xl border border-border/60 bg-card p-4 shrink-0 shadow-sm hover:bg-muted/20 transition-colors cursor-pointer"
              style={{ borderLeft: `3px solid ${shoot.color}` }}
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">{shoot.eventType}</span>
                <span className="text-xs font-mono text-muted-foreground">{shoot.time}</span>
              </div>
              
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-foreground">{shoot.title}</h3>
                <p className="text-xs text-muted-foreground">{shoot.clientName}</p>
              </div>

              <div className="mt-auto flex justify-between items-center">
                <p className="text-xs text-muted-foreground truncate max-w-[140px]" title={shoot.venue}>
                  {shoot.venue}
                </p>
                <div className="flex items-center gap-2">
                  <a 
                    href={`https://wa.me/91${shoot.phone}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex lg:hidden group-hover:flex items-center justify-center w-8 h-8 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                    aria-label="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <button className="text-xs font-medium text-foreground hover:bg-muted/50 px-3 py-1.5 rounded-sm transition-colors border border-transparent hover:border-border/60">
                    View Brief
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
