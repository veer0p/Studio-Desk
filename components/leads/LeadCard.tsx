"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { 
  Calendar, 
  CircleDollarSign, 
  Clock, 
  MoreHorizontal,
  Mail,
  Phone,
  MessageCircle
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { cn } from "@/lib/utils";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";

interface LeadCardProps {
  lead: any;
  onClick?: (lead: any) => void;
  isDragging?: boolean;
}

const SOURCE_ICONS: Record<string, any> = {
  inquiry_form: Mail,
  phone: Phone,
  whatsapp: MessageCircle,
  instagram: MoreHorizontal,
  facebook: MoreHorizontal,
};

export function LeadCard({ lead, onClick, isDragging: isDraggingProp }: LeadCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSorting,
  } = useSortable({ id: lead.id });

  const isDragging = isDraggingProp || isSorting;

  const style = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : 1,
  };

  const SourceIcon = SOURCE_ICONS[lead.source] || MoreHorizontal;
  const isOverdue = lead.follow_up_at && new Date(lead.follow_up_at) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group bg-white rounded-xl border border-slate-200 p-4 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all cursor-grab active:cursor-grabbing relative overflow-hidden",
        isDragging && "shadow-xl ring-2 ring-primary/20 cursor-grabbing"
      )}
      onClick={() => onClick?.(lead)}
      {...attributes}
      {...listeners}
    >
      {/* Follow-up Indicator */}
      {isOverdue && (
        <div className="absolute top-0 right-0 w-2 h-2 bg-amber-500 rounded-bl-lg" title="Follow-up Overdue" />
      )}

      <div className="flex justify-between items-start gap-2 mb-3">
        <h4 className="font-bold text-sm text-slate-900 truncate flex-1">
          {lead.client_name || lead.client?.full_name || "Unknown Client"}
        </h4>
        <SourceIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-xs font-medium text-slate-600">{lead.event_type}</span>
        </div>

        {lead.event_date_approx && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <Calendar className="w-3 h-3" />
            {format(new Date(lead.event_date_approx), "MMM d, yyyy")}
          </div>
        )}

        {(lead.budget_min || lead.budget_max) && (
          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
            <CircleDollarSign className="w-3 h-3" />
            {lead.budget_min ? `₹${(lead.budget_min / 1000).toFixed(0)}K` : "0"}
            {lead.budget_max ? ` - ₹${(lead.budget_max / 1000).toFixed(0)}K` : ""}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-slate-50 mt-auto">
        <div className="flex -space-x-1.5">
          {lead.assigned_to ? (
            <div className="w-5 h-5 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-bold text-slate-600">
              {lead.assigned_to_name?.[0] || "A"}
            </div>
          ) : (
            <div className="w-5 h-5 rounded-full bg-slate-50 border-2 border-white dashed flex items-center justify-center text-[8px] text-slate-300">
              ?
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 text-[9px] text-slate-400 font-medium">
          <Clock className="w-2.5 h-2.5" />
          {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
        </div>
      </div>
    </div>
  );
}
