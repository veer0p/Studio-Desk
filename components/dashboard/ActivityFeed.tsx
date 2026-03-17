import { formatDistanceToNow } from "date-fns";
import { 
  UserPlus, 
  Receipt, 
  Images, 
  CheckCircle2, 
  MessageSquare,
  Zap
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP = {
  lead_created: UserPlus,
  invoice_paid: Receipt,
  gallery_uploaded: Images,
  contract_signed: CheckCircle2,
  message_sent: MessageSquare,
  automation_triggered: Zap
};

const COLOR_MAP = {
  lead_created: "text-blue-500 bg-blue-50",
  invoice_paid: "text-emerald-500 bg-emerald-50",
  gallery_uploaded: "text-purple-500 bg-purple-50",
  contract_signed: "text-teal-500 bg-teal-50",
  message_sent: "text-amber-500 bg-amber-50",
  automation_triggered: "text-slate-500 bg-slate-50"
};

interface Activity {
  id: string;
  event_type: keyof typeof ICON_MAP;
  metadata: any;
  created_at: string;
}

export function ActivityFeed({ activities = [] }: { activities: Activity[] }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="p-6 border-b">
        <h3 className="font-bold">Recent Activity</h3>
      </div>
      <div className="divide-y divide-slate-50">
        {activities.length > 0 ? (
          activities.map((activity) => {
            const Icon = ICON_MAP[activity.event_type] || Zap;
            const colors = COLOR_MAP[activity.event_type] || COLOR_MAP.automation_triggered;

            return (
              <div key={activity.id} className="p-4 flex gap-4 hover:bg-slate-50/50 transition-colors">
                <div className={cn("w-10 h-10 rounded-full flex items-center justify-center shrink-0", colors)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {activity.metadata?.message || "Something happened"}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-muted-foreground text-sm italic">
            No recent activities found
          </div>
        )}
      </div>
      <div className="p-4 bg-slate-50 text-center">
        <button className="text-xs font-bold text-accent hover:underline">View All Activity</button>
      </div>
    </div>
  );
}
