"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface KPICardProps {
  label: string;
  value: number;
  format?: 'inr' | 'number' | 'percent';
  trend?: number;
  trendPeriod?: string;
  icon: LucideIcon;
  color: 'blue' | 'emerald' | 'amber' | 'purple';
}

export function KPICard({ label, value, format = 'number', trend, trendPeriod, icon: Icon, color }: KPICardProps) {
  const formatValue = (val: number) => {
    if (format === 'inr') {
      return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
      }).format(val);
    }
    if (format === 'percent') return `${val}%`;
    return val.toLocaleString();
  };

  const colors = {
    blue: "bg-blue-50 text-blue-600",
    emerald: "bg-emerald-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
    purple: "bg-purple-50 text-purple-600",
  };

  return (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner", colors[color])}>
          <Icon className="w-6 h-6" />
        </div>
        {trend !== undefined && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-black tracking-tighter",
            trend >= 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
          )}>
            {trend >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{label}</h4>
        <p className="text-2xl font-black text-slate-900 tracking-tight">{formatValue(value)}</p>
      </div>

      {trendPeriod && (
        <p className="text-[10px] font-bold text-slate-300">vs {trendPeriod}</p>
      )}
    </div>
  );
}
