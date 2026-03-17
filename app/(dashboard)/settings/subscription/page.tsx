"use client";

import { Check, Crown, Zap, Shield, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const plans = [
  { id: 'starter', name: 'Starter', price: '₹999', period: '/mo', accent: 'bg-slate-100', text: 'text-slate-600', popular: false },
  { id: 'pro', name: 'Studio Pro', price: '₹2,499', period: '/mo', accent: 'bg-primary/10', text: 'text-primary', popular: true },
  { id: 'elite', name: 'Elite', price: '₹5,999', period: '/mo', accent: 'bg-purple-100', text: 'text-purple-600', popular: false },
];

export default function SubscriptionPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Subscription</h1>
          <p className="text-sm font-medium text-slate-400">Manage your plan and usage limits</p>
        </div>
      </div>

      {/* Current Plan Overview */}
      <div className="bg-slate-900 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-slate-200 overflow-hidden relative">
         <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full -mr-32 -mt-32 blur-3xl" />
         <div className="relative z-10 flex flex-col md:flex-row justify-between gap-10">
            <div className="space-y-6 flex-1">
               <div className="space-y-2">
                  <Badge className="bg-white/10 text-white border-none px-3 font-black text-[10px]">CURRENT PLAN</Badge>
                  <h2 className="text-4xl font-black tracking-tight flex items-center gap-3">
                     Studio Pro <Crown className="w-8 h-8 text-primary shadow-primary" />
                  </h2>
               </div>
               <div className="space-y-4 max-w-sm">
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                        <span>Lead Usage</span>
                        <span>142 / 500</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-primary w-[28%] rounded-full shadow-[0_0_12px_rgba(42,126,200,0.5)]" />
                     </div>
                  </div>
                  <div className="space-y-2">
                     <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                        <span>Storage</span>
                        <span>64GB / 250GB</span>
                     </div>
                     <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-400 w-[25%] rounded-full shadow-[0_0_12px_rgba(52,211,153,0.5)]" />
                     </div>
                  </div>
               </div>
            </div>

            <div className="bg-white/5 border border-white/10 p-8 rounded-[2rem] flex flex-col justify-between text-center min-w-[200px]">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40">Renewal Date</p>
                  <p className="text-xl font-black">Nov 15, 2025</p>
               </div>
               <Button className="mt-6 h-12 rounded-xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50">Manage Billing</Button>
            </div>
         </div>
      </div>

      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest px-2">Upgrade or Change Plan</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {plans.map((plan) => (
           <div key={plan.id} className={cn(
             "bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm flex flex-col justify-between group hover:shadow-xl transition-all scale-100 hover:scale-[1.02]",
             plan.popular && "border-primary"
           )}>
              <div className="space-y-6">
                 {plan.popular && <Badge className="bg-primary/20 text-primary border-none font-black text-[9px] px-2 py-0.5">MOST POPULAR</Badge>}
                 <div className="space-y-2">
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{plan.name}</h4>
                    <div className="flex items-baseline gap-1">
                       <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                       <span className="text-xs font-bold text-slate-400">{plan.period}</span>
                    </div>
                 </div>
                 
                 <div className="space-y-3">
                    {['15 Team Members', 'Unlimited Bookings', '24/7 Priority Support', 'Advance Analytics'].map(f => (
                      <div key={f} className="flex items-center gap-2">
                         <div className="w-5 h-5 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3" />
                         </div>
                         <span className="text-xs font-bold text-slate-500">{f}</span>
                      </div>
                    ))}
                 </div>
              </div>

              <Button variant={plan.popular ? 'default' : 'outline'} className={cn(
                "w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest",
                plan.popular ? "bg-primary text-white shadow-xl shadow-primary/20" : "border-slate-200 text-slate-900"
              )}>
                 {plan.id === 'pro' ? 'Current Plan' : 'Select Plan'}
              </Button>
           </div>
         ))}
      </div>
    </div>
  );
}
