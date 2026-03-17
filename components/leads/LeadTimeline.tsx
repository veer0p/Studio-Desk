import { formatDistanceToNow } from "date-fns";
import { 
  UserPlus, 
  Receipt, 
  Send, 
  CheckCircle2, 
  FileText,
  Camera,
  Images,
  MessageSquare,
  Zap,
  ArrowRightLeft,
  StickyNote
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, any> = {
  lead_created: UserPlus,
  lead_updated: Zap,
  lead_converted: ArrowRightLeft,
  proposal_sent: Send,
  proposal_accepted: CheckCircle2,
  proposal_rejected: Zap,
  contract_sent: FileText,
  contract_signed: CheckCircle2,
  advance_invoice_sent: Receipt,
  advance_payment_received: Receipt,
  team_assigned: UserPlus,
  shoot_confirmed: Camera,
  photos_uploaded: Images,
  gallery_published: Images,
  automation_sent: Zap,
  note_added: StickyNote,
  status_changed: ArrowRightLeft,
};

const COLOR_MAP: Record<string, string> = {
  lead_created: "bg-blue-500",
  lead_converted: "bg-emerald-500",
  proposal_sent: "bg-purple-500",
  contract_signed: "bg-indigo-500",
  advance_payment_received: "bg-teal-500",
  note_added: "bg-amber-500",
};

interface TimelineActivity {
  id: string;
  event_type: string;
  description?: string;
  note?: string;
  actor_name?: string;
  created_at: string;
  metadata?: any;
}

interface LeadTimelineProps {
  activities: TimelineActivity[];
  loading?: boolean;
}

export function LeadTimeline({ activities, loading }: LeadTimelineProps) {
  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-4 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-slate-100 rounded w-1/2" />
              <div className="h-3 bg-slate-100 rounded w-1/4" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground italic text-sm">
        No activity history found.
      </div>
    );
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-mb-8">
        {activities.map((activity, idx) => {
          const Icon = ICON_MAP[activity.event_type] || Zap;
          const iconColor = COLOR_MAP[activity.event_type] || "bg-slate-400";
          const isLast = idx === activities.length - 1;

          return (
            <li key={activity.id}>
              <div className="relative pb-8">
                {!isLast && (
                  <span className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-100" aria-hidden="true" />
                )}
                <div className="relative flex space-x-3">
                  <div>
                    <span className={cn(
                      "h-8 w-8 rounded-full flex items-center justify-center ring-4 ring-white",
                      iconColor
                    )}>
                      <Icon className="h-4 w-4 text-white" aria-hidden="true" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                    <div>
                      <p className="text-sm text-slate-600">
                        {activity.description || activity.event_type.replace(/_/g, " ")}
                        {activity.actor_name && (
                          <span className="font-medium text-slate-900 ml-1">
                            by {activity.actor_name}
                          </span>
                        )}
                      </p>
                      {activity.note && (
                        <div className="mt-2 text-sm text-slate-500 bg-slate-50 p-2 rounded-lg border border-slate-100 italic">
                          "{activity.note}"
                        </div>
                      )}
                    </div>
                    <div className="whitespace-nowrap text-right text-[10px] font-medium text-slate-400">
                      {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
