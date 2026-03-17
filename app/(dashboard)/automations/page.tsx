"use client";

import { 
  Zap, 
  Settings, 
  History, 
  FileText, 
  MessageSquare, 
  Mail, 
  Plus, 
  ArrowRight,
  Sparkles,
  Search,
  CheckCircle2,
  Clock,
  XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { AutomationCard } from "@/components/automations/AutomationCard";
import Link from "next/link";
import { cn } from "@/lib/utils";

const automationTypes = [
  { id: "lead_inquiry_auto_reply", title: "New Inquiry Reply", description: "Sent instantly when a client fills your Lead Inquiry form.", trigger: "Lead Inquiry", channels: ["email", "whatsapp"], status: "active" },
  { id: "booking_confirmation", title: "Booking Confirmation", description: "Sent when a quote is accepted and booking is confirmed.", trigger: "Booking Confirmed", channels: ["email", "whatsapp"], status: "active" },
  { id: "payment_received", title: "Payment Confirmation", description: "Sent when a payment is recorded or Razorpay succeeds.", trigger: "Payment Recorded", channels: ["email", "whatsapp"], status: "active" },
  { id: "shoot_reminder_24h", title: "Shoot Reminder (24h)", description: "Sent to client and assigned team 24h before shoot.", trigger: "Shoot Day - 1", channels: ["email", "whatsapp"], status: "active" },
  { id: "proposal_unsigned_reminder", title: "Proposal Follow-up", description: "Sent if a proposal isn't signed within 3 days.", trigger: "3 Days Unsigned", channels: ["email"], status: "draft" },
  { id: "invoice_overdue_reminder", title: "Overdue Invoice", description: "Sent on the day an invoice becomes overdue.", trigger: "Payment Overdue", channels: ["email"], status: "inactive" },
  { id: "gallery_delivery", title: "Gallery Out", description: "Sent when you mark a gallery as delivered.", trigger: "Gallery Delivered", channels: ["whatsapp", "email"], status: "active" },
  { id: "review_request", title: "Review Request", description: "Sent 5 days after final delivery to ask for Google review.", trigger: "Delivery + 5 Days", channels: ["whatsapp"], status: "inactive" },
];

export default function AutomationsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <Zap className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Automations</h1>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium">Auto-pilot for your client communication.</p>
           </div>
        </div>

        <div className="flex gap-3">
           <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-200 shadow-sm" asChild>
              <Link href="/automations/templates">
                <FileText className="w-4 h-4 mr-2" /> Templates
              </Link>
           </Button>
           <Button className="h-11 px-6 rounded-xl font-bold bg-slate-900 shadow-xl shadow-slate-200/50" asChild>
              <Link href="/automations/log">
                <History className="w-4 h-4 mr-2" /> Delivery Log
              </Link>
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {automationTypes.map((automation) => (
           <AutomationCard key={automation.id} automation={automation as any} />
         ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
         {/* Recent Delivery Logs */}
         <section className="xl:col-span-8 space-y-6">
            <div className="flex justify-between items-center">
               <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <Clock className="w-4 h-4" /> Recent Deliveries
               </h2>
               <Link href="/automations/log" className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">View All</Link>
            </div>
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
               <div className="divide-y divide-slate-50">
                  {[
                    { client: "Priya Sharma", type: "Booking Confirmation", channel: "whatsapp", time: "10 mins ago", status: "delivered" },
                    { client: "Amit Patel", type: "New Inquiry Reply", channel: "email", time: "2 hours ago", status: "delivered" },
                    { client: "Neha Gupta", type: "Shoot Reminder", channel: "whatsapp", time: "1 day ago", status: "delivered" },
                    { client: "Vikram Singh", type: "Payment Confirmation", channel: "email", time: "2 days ago", status: "failed" },
                  ].map((log, i) => (
                    <div key={i} className="p-6 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                            log.channel === 'whatsapp' ? 'bg-emerald-50 text-emerald-500' : 'bg-blue-50 text-blue-500'
                          )}>
                             {log.channel === 'whatsapp' ? <MessageSquare className="w-5 h-5" /> : <Mail className="w-5 h-5" />}
                          </div>
                          <div>
                             <div className="text-sm font-bold text-slate-900">{log.type}</div>
                             <div className="text-[10px] text-slate-400 font-medium">To: {log.client} • {log.time}</div>
                          </div>
                       </div>
                       <div className="flex items-center gap-4">
                          {log.status === 'delivered' ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase px-3">Success</Badge>
                          ) : (
                            <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px] uppercase px-3">Failed</Badge>
                          )}
                          <Button variant="ghost" size="icon" className="h-9 w-9 opacity-0 group-hover:opacity-100 transition-opacity">
                             <ArrowRight className="w-4 h-4 text-slate-400" />
                          </Button>
                       </div>
                    </div>
                  ))}
               </div>
            </Card>
         </section>

         {/* Automation Performance */}
         <aside className="xl:col-span-4 space-y-6">
            <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
               <Sparkles className="w-4 h-4" /> Studio Optimization
            </h2>
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-8 bg-slate-900 text-white space-y-8">
               <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Time Saved This Month</p>
                  <h3 className="text-4xl font-black tracking-tighter">42.5 <span className="text-lg font-bold text-primary">Hours</span></h3>
               </div>

               <div className="space-y-4 pt-4 border-t border-white/10">
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-400">Total Sent</span>
                     <span className="text-xs font-black">1,248</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-400">Success Rate</span>
                     <span className="text-xs font-black text-emerald-400">99.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                     <span className="text-xs font-bold text-slate-400">WhatsApp Open Rate</span>
                     <span className="text-xs font-black text-blue-400">94.1%</span>
                  </div>
               </div>

               <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-[10px] font-medium leading-relaxed text-slate-400">
                  Automations are firing successfully. WhatsApp templates are approved and Meta connection is healthy.
               </div>
            </Card>
         </aside>
      </div>
    </div>
  );
}
