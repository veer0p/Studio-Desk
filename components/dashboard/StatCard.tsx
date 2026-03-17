import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isUp: boolean;
  };
  className?: string;
}

export function StatCard({ label, value, description, icon: Icon, trend, className }: StatCardProps) {
  return (
    <div className={cn("bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4", className)}>
      <div className="flex justify-between items-start">
        <div className="p-2 bg-slate-50 rounded-lg group-hover:bg-accent/10 transition-colors">
          <Icon className="w-5 h-5 text-primary" />
        </div>
        {trend && (
          <div className={cn(
            "text-xs font-bold px-2 py-1 rounded-full",
            trend.isUp ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          )}>
            {trend.isUp ? "+" : "-"}{trend.value}%
          </div>
        )}
      </div>
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{label}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
    </div>
  );
}
