"use client";

import Link from "next/link";
import { User, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const clients = [
  { name: "Rahul & Sneha", count: 4, spend: 345000, last: "2 days ago" },
  { name: "TCS Corporate", count: 8, spend: 280000, last: "1 week ago" },
  { name: "Aditi Sharma", count: 2, spend: 125000, last: "3 weeks ago" },
  { name: "JW Marriott", count: 5, spend: 95000, last: "1 month ago" },
  { name: "Priya Singh", count: 1, spend: 85000, last: "2 months ago" },
];

export function TopClientsTable() {
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-12 px-6 py-4 border-b border-slate-50">
        <div className="col-span-1 text-[10px] font-black uppercase tracking-widest text-slate-400">#</div>
        <div className="col-span-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Client</div>
        <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400">Bookings</div>
        <div className="col-span-2 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Total Spend</div>
        <div className="col-span-2"></div>
      </div>

      <div className="divide-y divide-slate-50">
        {clients.map((client, idx) => (
          <div key={client.name} className="grid grid-cols-12 px-6 py-5 items-center hover:bg-slate-50/50 transition-colors group">
            <div className="col-span-1">
               <div className={cn(
                 "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black",
                 idx === 0 ? "bg-amber-100 text-amber-700" : idx === 1 ? "bg-slate-200 text-slate-700" : "bg-slate-50 text-slate-400"
               )}>
                 {idx + 1}
               </div>
            </div>
            <div className="col-span-5 flex items-center gap-3">
               <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-300">
                  <User className="w-5 h-5" />
               </div>
               <div>
                  <p className="text-sm font-black text-slate-900 tracking-tight">{client.name}</p>
                  <p className="text-[10px] font-bold text-slate-400">Last event {client.last}</p>
               </div>
            </div>
            <div className="col-span-2">
               <span className="text-xs font-black text-slate-900">{client.count} Project{client.count > 1 ? 's' : ''}</span>
            </div>
            <div className="col-span-2 text-right">
               <p className="text-sm font-black text-emerald-600">₹{client.spend.toLocaleString('en-IN')}</p>
            </div>
            <div className="col-span-2 text-right">
               <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl opacity-0 group-hover:opacity-100">
                  <ChevronRight className="w-4 h-4 text-slate-400" />
               </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { cn } from "@/lib/utils";
