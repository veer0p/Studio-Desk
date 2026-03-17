import { cn } from "@/lib/utils";

const LEAD_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  new_lead: { label: "New Lead", className: "bg-blue-50 text-blue-700 border-blue-100" },
  contacted: { label: "Contacted", className: "bg-amber-50 text-amber-700 border-amber-100" },
  proposal_sent: { label: "Proposal Sent", className: "bg-purple-50 text-purple-700 border-purple-100" },
  contract_signed: { label: "Contract Signed", className: "bg-indigo-50 text-indigo-700 border-indigo-100" },
  advance_paid: { label: "Advance Paid", className: "bg-cyan-50 text-cyan-700 border-cyan-100" },
  shoot_scheduled: { label: "Shoot Scheduled", className: "bg-orange-50 text-orange-700 border-orange-100" },
  delivered: { label: "Delivered", className: "bg-teal-50 text-teal-700 border-teal-100" },
  closed: { label: "Closed", className: "bg-slate-50 text-slate-700 border-slate-100" },
  lost: { label: "Lost", className: "bg-rose-50 text-rose-700 border-rose-100" },
};

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = LEAD_STATUS_CONFIG[status] || { label: status, className: "bg-slate-50 text-slate-600 border-slate-100" };

  return (
    <span className={cn(
      "px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border",
      config.className,
      className
    )}>
      {config.label}
    </span>
  );
}
