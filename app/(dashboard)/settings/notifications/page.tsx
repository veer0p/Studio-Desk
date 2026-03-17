"use client";

import { Bell, Mail, MessageSquare, Smartphone, Zap, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { toast } from "sonner";

const notificationGroups = [
  {
    title: "Project Events",
    desc: "Updates regarding new leads and booking changes",
    items: [
      { id: 'new_lead', label: 'New Lead Discovery', sub: 'Instant WhatsApp alert when a lead finds you', default: true },
      { id: 'payment_received', label: 'Payment Confirmation', sub: 'Email notification for every credit/transaction', default: true },
      { id: 'contract_signed', label: 'Contract Execution', sub: 'Push notification when clients sign your agreement', default: true }
    ]
  },
  {
    title: "Automation & Reminders",
    desc: "Control system-generated communication",
    items: [
      { id: 'due_reminders', label: 'Payment Due Reminders', sub: 'Notify team when invoices are nearing deadlines', default: true },
      { id: 'gallery_ready', label: 'Gallery Delivery Ready', sub: 'Notify when post-production workflow completes', default: false },
      { id: 'client_message', label: 'Client Messages', sub: 'Real-time alerts for portal chat activity', default: true }
    ]
  }
];

export default function NotificationsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    new_lead: true,
    payment_received: true,
    contract_signed: true,
    due_reminders: true,
    gallery_ready: false,
    client_message: true
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Notifications</h1>
          <p className="text-sm font-medium text-slate-400">Configure how you and your team stay informed</p>
        </div>
        <Button onClick={() => toast.success("Preferences updated")} className="h-11 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest gap-2">
           <Save className="w-4 h-4" /> Update Preferences
        </Button>
      </div>

      <div className="space-y-8">
         {notificationGroups.map((group) => (
           <div key={group.title} className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm">
              <div className="px-10 py-8 bg-slate-50/50 border-b border-slate-50">
                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">{group.title}</h3>
                 <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">{group.desc}</p>
              </div>
              <div className="p-10 divide-y divide-slate-50">
                 {group.items.map((item) => (
                   <div key={item.id} className="py-6 flex items-center justify-between first:pt-0 last:pb-0 group">
                      <div className="space-y-1">
                         <Label className="text-sm font-black text-slate-900 tracking-tight cursor-pointer" htmlFor={item.id}>{item.label}</Label>
                         <p className="text-[11px] font-bold text-slate-400">{item.sub}</p>
                      </div>
                      <Switch 
                        id={item.id} 
                        checked={prefs[item.id]} 
                        onCheckedChange={(val) => setPrefs({...prefs, [item.id]: val})} 
                        className="data-[state=checked]:bg-primary"
                      />
                   </div>
                 ))}
              </div>
           </div>
         ))}
      </div>

      <div className="bg-blue-50/50 rounded-[2.5rem] p-10 border border-blue-100 flex flex-col md:flex-row items-center gap-8">
         <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-primary shadow-xl shrink-0">
            <Smartphone className="w-8 h-8" />
         </div>
         <div className="space-y-2 text-center md:text-left">
            <h4 className="text-lg font-black text-blue-900 tracking-tight leading-none">WhatsApp Business Hub</h4>
            <p className="text-sm font-bold text-blue-800/50 max-w-sm leading-relaxed">
               Most critical alerts are routed via WhatsApp. You can customize the specific templates and triggers in the 
               <Link href="/settings/whatsapp" className="text-primary hover:underline ml-1">WhatsApp Integration</Link> tab.
            </p>
         </div>
      </div>
    </div>
  );
}
