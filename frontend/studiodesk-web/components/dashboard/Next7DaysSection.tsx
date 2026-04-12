import { Skeleton } from "@/components/ui/skeleton"
import Link from "next/link"
import { CalendarClock } from "lucide-react"
import { ROUTES } from "@/lib/constants/routes"

export function Next7DaysSkeleton() {
  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 mb-3 pl-1">
        <div className="p-1 rounded-sm bg-muted/10 border-border/40 border">
          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Next 7 Days</h2>
      </div>
      <div className="rounded-xl border border-border/60 bg-card shadow-sm overflow-hidden">
        <div className="grid grid-cols-7 divide-x divide-border/40 border-b border-border/40 mb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="py-2 text-center flex flex-col items-center">
              <Skeleton className="h-3 w-6 rounded-sm mb-1" />
              <Skeleton className="h-4 w-6 rounded-sm" />
            </div>
          ))}
        </div>
        <div className="divide-y divide-border/40">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex px-4 py-3 gap-4 items-center">
              <Skeleton className="h-4 w-12 rounded-sm shrink-0" />
              <div className="w-px h-6 bg-border/40 shrink-0" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32 rounded-sm" />
                <Skeleton className="h-3 w-20 rounded-sm" />
              </div>
              <Skeleton className="w-[6px] h-[6px] rounded-sm shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

const UPCOMING_BOOKINGS = [
  {
    id: "upc-1",
    dayOffset: 2, 
    title: "Mehendi Ceremony",
    client: "Neha & Rohan",
    colorClass: "bg-purple-500" // Example event type color
  },
  {
    id: "upc-2",
    dayOffset: 3, 
    title: "Reception Evening",
    client: "Vikram Rajput",
    colorClass: "bg-indigo-500"
  },
  {
    id: "upc-3",
    dayOffset: 6, 
    title: "Maternity Shoot",
    client: "Aisha Verma",
    colorClass: "bg-sky-500"
  }
];

export default async function Next7DaysSection() {
  await new Promise((resolve) => setTimeout(resolve, 900))
  
  const today = new Date();
  const next7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return {
      date: d,
      dayName: d.toLocaleDateString("en-IN", { weekday: "short" }),
      dateNum: d.getDate(),
      isToday: i === 0,
      offset: i
    };
  });

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-3 mb-3 pl-1">
        <div className="p-1 rounded-sm bg-muted/10 border-border/40 border">
          <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <h2 className="text-xs font-semibold tracking-wide uppercase text-muted-foreground">Next 7 Days</h2>
      </div>
      
      <div className="rounded-xl border border-border/60 bg-card shadow-sm pt-2 overflow-hidden">
        {/* Part A: 7-day strip */}
        <div className="grid grid-cols-7 divide-x divide-border/40 border-b border-border/40">
          {next7Days.map((day) => {
            // Find if there is a shoot in this day to show dot
            const shootOnDay = UPCOMING_BOOKINGS.find(b => b.dayOffset === day.offset);
            
            return (
              <div 
                key={day.offset} 
                className={`py-2 flex flex-col items-center justify-center font-mono ${
                  day.isToday ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-muted/30 transition-colors'
                }`}
              >
                <div className="text-[10px] uppercase mb-0.5">{day.dayName}</div>
                <div className={`text-sm ${day.isToday ? 'font-bold' : ''}`}>{day.dateNum}</div>
                {/* 4px square dot if there's an event */}
                <div className="h-2 w-full flex justify-center mt-1">
                  {shootOnDay && !day.isToday && (
                    <div className={`w-1 h-1 mt-0.5 rounded-sm ${shootOnDay.colorClass}`} />
                  )}
                  {shootOnDay && day.isToday && (
                    <div className="w-1 h-1 mt-0.5 rounded-sm bg-background" />
                  )}
                </div>
              </div>
            )
          })}
        </div>
        
        {/* Part B: Upcoming bookings list */}
        <div className="divide-y divide-border/40">
          {UPCOMING_BOOKINGS.map((booking) => {
            const bookingDate = next7Days[booking.dayOffset];
            return (
              <div key={booking.id} className="flex px-4 py-3 gap-4 items-center hover:bg-muted/5 transition-colors">
                <div className="w-[45px] font-mono text-center shrink-0">
                  <div className="text-[10px] uppercase text-muted-foreground">{bookingDate.dayName}</div>
                  <div className="text-sm font-medium text-foreground">{bookingDate.dateNum}</div>
                </div>
                
                <div className="w-px h-8 bg-border/40 shrink-0" />
                
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-foreground">{booking.title}</h3>
                  <p className="text-xs text-muted-foreground">{booking.client}</p>
                </div>
                
                {/* 3px square geometric indicator */}
                <div className={`w-[6px] h-[6px] shrink-0 rounded-[1px] ${booking.colorClass}`} />
              </div>
            )
          })}
          
          <div className="px-4 py-3 text-center hover:bg-muted/10 transition-colors">
            <Link href={ROUTES.BOOKINGS} className="text-xs font-mono font-medium text-primary hover:text-primary-hover hover:underline">
              View all bookings &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
