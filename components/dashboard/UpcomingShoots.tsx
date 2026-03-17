import { format } from "date-fns";
import { Calendar, MapPin, Clock, ChevronRight } from "lucide-react";

interface Shoot {
  id: string;
  client_name: string;
  event_type: string;
  shoot_date: string;
  location: string;
  status: string;
}

export function UpcomingShoots({ shoots = [] }: { shoots: Shoot[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b flex justify-between items-center">
        <h3 className="font-bold">Upcoming Shoots</h3>
        <span className="text-xs font-bold text-accent bg-accent/10 px-2 py-1 rounded-full">
          {shoots.length} This Week
        </span>
      </div>
      <div className="divide-y divide-slate-50">
        {shoots.length > 0 ? (
          shoots.map((shoot) => (
            <div key={shoot.id} className="p-4 group hover:bg-slate-50/50 transition-colors cursor-pointer">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-bold text-sm">{shoot.client_name}</p>
                  <p className="text-xs text-accent font-medium">{shoot.event_type}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-accent group-hover:translate-x-1 transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3">
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <Calendar className="w-3 h-3" />
                  {format(new Date(shoot.shoot_date), "MMM d, yyyy")}
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                  <MapPin className="w-3 h-3 truncate" />
                  <span className="truncate">{shoot.location}</span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm italic">
            No shoots scheduled for this week
          </div>
        )}
      </div>
      <div className="p-4 bg-slate-50 text-center">
        <button className="text-xs font-bold text-accent hover:underline">Open Calendar</button>
      </div>
    </div>
  );
}
