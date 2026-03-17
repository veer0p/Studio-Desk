import { 
  FileText, 
  MessageSquare, 
  Mail, 
  Plus, 
  Search, 
  Filter, 
  Edit3, 
  ExternalLink,
  Trash2,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

async function getTemplates() {
  return [
    { id: "temp-1", name: "Lead Welcome Email", category: "marketing", type: "email", status: "published", updated: "2 days ago" },
    { id: "temp-2", name: "Booking Confirmed", category: "transactional", type: "email", status: "published", updated: "1 week ago" },
    { id: "temp-w1", name: "Inquiry_Auto_Reply", category: "utility", type: "whatsapp", status: "approved", updated: "5 hours ago" },
    { id: "temp-w2", name: "Shoot_Reminder_24h", category: "utility", type: "whatsapp", status: "pending", updated: "Just now" },
    { id: "temp-3", name: "Proposal Follow-up", category: "marketing", type: "email", status: "draft", updated: "3 days ago" },
  ];
}

export default async function TemplatesPage() {
  const templates = await getTemplates();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Templates</h1>
          <p className="text-sm text-muted-foreground mt-0.5 font-medium">Manage your branded communication assets.</p>
        </div>

        <div className="flex gap-3">
           <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-200 shadow-sm" asChild>
              <Link href="/automations/templates/whatsapp/new">
                <MessageSquare className="w-4 h-4 mr-2" /> Register WhatsApp
              </Link>
           </Button>
           <Button className="h-11 px-6 rounded-xl font-bold bg-primary shadow-xl shadow-primary/20">
              <Plus className="w-4 h-4 mr-2" /> New Email Template
           </Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search templates..." className="pl-10 h-11 border-slate-200 rounded-xl bg-white shadow-sm" />
         </div>
         <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold px-6 bg-white shadow-sm">
            <Filter className="w-4 h-4 mr-2" /> All Types
         </Button>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
         <Table>
            <TableHeader className="bg-slate-50/50">
               <TableRow className="border-b-slate-100 hover:bg-transparent h-14">
                  <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Template Name</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Channel</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Category</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Last Updated</TableHead>
                  <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Actions</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {templates.map((temp) => (
                 <TableRow key={temp.id} className="group border-b-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-8 whitespace-nowrap">
                       <div className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{temp.name}</div>
                       <div className="text-[10px] text-slate-400 font-medium">ID: {temp.id}</div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-7 h-7 rounded-lg flex items-center justify-center",
                            temp.type === 'whatsapp' ? "bg-emerald-50 text-emerald-500" : "bg-blue-50 text-blue-500"
                          )}>
                             {temp.type === 'whatsapp' ? <MessageSquare className="w-4 h-4" /> : <Mail className="w-4 h-4" />}
                          </div>
                          <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{temp.type}</span>
                       </div>
                    </TableCell>
                    <TableCell>
                       <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-slate-100 text-slate-400">
                          {temp.category}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                       <div className="flex items-center justify-center gap-1.5">
                          {temp.status === 'approved' || temp.status === 'published' ? (
                            <>
                               <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">{temp.status}</span>
                            </>
                          ) : temp.status === 'pending' ? (
                            <>
                               <Clock className="w-3 h-3 text-amber-500" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Reviewing</span>
                            </>
                          ) : (
                            <>
                               <AlertCircle className="w-3 h-3 text-slate-300" />
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Draft</span>
                            </>
                          )}
                       </div>
                    </TableCell>
                    <TableCell className="text-right text-[10px] font-bold text-slate-400">{temp.updated}</TableCell>
                    <TableCell className="pr-8 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-slate-50 shadow-sm bg-white" asChild>
                             <Link href={temp.type === 'email' ? `/automations/templates/email/${temp.id}` : '#'}>
                                <Edit3 className="w-4 h-4 text-slate-400" />
                             </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-9 w-9 rounded-xl border border-slate-50 shadow-sm bg-white">
                             <Trash2 className="w-4 h-4 text-rose-400" />
                          </Button>
                       </div>
                    </TableCell>
                 </TableRow>
               ))}
            </TableBody>
         </Table>
      </Card>
    </div>
  );
}
