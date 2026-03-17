"use client";

import { 
  ChevronLeft, 
  Search, 
  Filter, 
  Download, 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  XCircle,
  Clock,
  ExternalLink,
  ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import Link from "next/link";
import { cn } from "@/lib/utils";

const logs = [
  { id: "log-1", client: "Siddharth Malhotra", type: "Booking Confirmation", channel: "whatsapp", status: "delivered", time: "2024-03-20 14:30", trackingId: "WA_987234" },
  { id: "log-2", client: "Ananya Roy", type: "Inquiry Auto Reply", channel: "email", status: "delivered", time: "2024-03-20 12:15", trackingId: "EM_552110" },
  { id: "log-3", client: "Vikram Chatterjee", type: "Payment Received", channel: "whatsapp", status: "failed", time: "2024-03-19 18:45", error: "WhatsApp disconnected", trackingId: "WA_987235" },
  { id: "log-4", client: "Pooja Hegde", type: "Shoot Reminder", channel: "email", status: "delivered", time: "2024-03-19 09:00", trackingId: "EM_552111" },
  { id: "log-5", client: "Varun Dhawan", type: "Gallery Out", channel: "whatsapp", status: "delivered", time: "2024-03-18 20:20", trackingId: "WA_987236" },
  { id: "log-6", client: "Kiara Advani", type: "Review Request", channel: "whatsapp", status: "delivered", time: "2024-03-18 11:10", trackingId: "WA_987237" },
];

export default function AutomationLogsPage() {
  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100" asChild>
              <Link href="/automations">
                 <ChevronLeft className="w-5 h-5 text-slate-400" />
              </Link>
           </Button>
           <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Delivery Log</h1>
              <p className="text-sm text-muted-foreground font-medium">History of all automated messages sent to clients.</p>
           </div>
        </div>

        <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-200 shadow-sm bg-white">
           <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {[
           { label: "Delivered Today", value: "148", color: "emerald" },
           { label: "Failed (24h)", value: "2", color: "rose" },
           { label: "Active Queued", value: "12", color: "blue" },
         ].map((stat) => (
           <Card key={stat.label} className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-6 bg-white overflow-hidden relative">
              <div className={cn(
                "absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 rounded-full opacity-10",
                stat.color === 'emerald' ? 'bg-emerald-500' : stat.color === 'rose' ? 'bg-rose-500' : 'bg-blue-500'
              )} />
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
           </Card>
         ))}
      </div>

      <div className="flex flex-col md:flex-row items-center gap-4">
         <div className="relative flex-1 group w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search by client name or tracking ID..." className="pl-12 h-12 border-slate-100 rounded-2xl bg-white shadow-sm" />
         </div>
         <div className="flex items-center gap-3 w-full md:w-auto">
            <Button variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-2xl border-slate-100 font-bold bg-white shadow-sm">
               <Filter className="w-4 h-4 mr-2" /> Status
            </Button>
            <Button variant="outline" className="h-12 flex-1 md:flex-none px-6 rounded-2xl border-slate-100 font-bold bg-white shadow-sm">
               <Clock className="w-4 h-4 mr-2" /> Date Range
            </Button>
         </div>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
         <Table>
            <TableHeader className="bg-slate-50/50">
               <TableRow className="border-b-slate-100 hover:bg-transparent h-14">
                  <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Client</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Content Type</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Channel</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                  <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Tracking ID</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {logs.map((log) => (
                 <TableRow key={log.id} className="group border-b-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-8 whitespace-nowrap text-[11px] font-bold text-slate-400">
                       {log.time}
                    </TableCell>
                    <TableCell className="font-bold text-slate-900 text-sm">
                       {log.client}
                    </TableCell>
                    <TableCell className="text-xs font-medium text-slate-500">
                       {log.type}
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          {log.channel === 'whatsapp' ? (
                            <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-500">
                               <MessageSquare className="w-3.5 h-3.5" />
                            </div>
                          ) : (
                            <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500">
                               <Mail className="w-3.5 h-3.5" />
                            </div>
                          )}
                          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{log.channel}</span>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex flex-col items-center gap-1">
                          {log.status === 'delivered' ? (
                            <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[9px] uppercase px-3 flex gap-1 items-center">
                               <CheckCircle2 className="w-3 h-3" /> Sent
                            </Badge>
                          ) : (
                            <Badge className="bg-rose-50 text-rose-600 border-none font-black text-[9px] uppercase px-3 flex gap-1 items-center">
                               <XCircle className="w-3 h-3" /> Failed
                            </Badge>
                          )}
                          {log.error && <p className="text-[8px] font-bold text-rose-400">{log.error}</p>}
                       </div>
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                       <code className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                          {log.trackingId}
                       </code>
                    </TableCell>
                 </TableRow>
               ))}
            </TableBody>
         </Table>
      </Card>
    </div>
  );
}
