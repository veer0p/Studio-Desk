"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Wallet,
  Clock,
  Mail,
  Phone,
  MessageCircle,
  MoreVertical,
  Edit,
  Trash2,
  ArrowRight
} from "lucide-react";
import { format } from "date-fns";
import { StatusBadge } from "./StatusBadge";
import { LeadTimeline } from "./LeadTimeline";

interface LeadDetailDrawerProps {
  lead: any | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onEdit?: (lead: any) => void;
  onConvert?: (lead: any) => void;
}

export function LeadDetailDrawer({ 
  lead, 
  open, 
  onOpenChange,
  onEdit,
  onConvert
}: LeadDetailDrawerProps) {
  if (!lead) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader className="pb-6">
          <div className="flex justify-between items-start">
            <StatusBadge status={lead.status} className="mb-2" />
            <div className="flex gap-2">
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => onEdit?.(lead)}>
                <Edit className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-8 w-8 text-rose-600 hover:text-rose-700">
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <SheetTitle className="text-2xl font-bold">{lead.client_name || lead.client?.full_name}</SheetTitle>
          <SheetDescription className="flex items-center gap-2 mt-1">
             <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider">
               {lead.event_type}
             </span>
             <span className="text-slate-400">•</span>
             <span className="text-slate-500">Source: {lead.source.replace('_', ' ')}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="flex gap-2 mb-8">
           <Button className="flex-1" onClick={() => onConvert?.(lead)}>
             Convert to Booking <ArrowRight className="w-4 h-4 ml-2" />
           </Button>
           <Button variant="outline" className="flex-1">
             Send Proposal
           </Button>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="timeline">History</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-8">
            {/* Contact Info */}
            <div className="grid grid-cols-1 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                  <Phone className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Phone</div>
                  <div className="text-sm font-medium">{lead.phone || lead.client?.phone || "—"}</div>
                </div>
                <div className="ml-auto flex gap-1">
                   <Button variant="ghost" size="icon" className="h-7 w-7 text-emerald-600">
                     <MessageCircle className="w-4 h-4" />
                   </Button>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center border border-slate-200 shadow-sm">
                  <Mail className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase">Email</div>
                  <div className="text-sm font-medium">{lead.email || lead.client?.email || "—"}</div>
                </div>
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-4">
               <h4 className="text-sm font-bold text-slate-900 border-l-4 border-primary pl-3">Event Details</h4>
               <div className="grid grid-cols-2 gap-y-6">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Calendar className="w-3.5 h-3.5" /> Date
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                      {lead.event_date_approx ? format(new Date(lead.event_date_approx), "MMMM d, yyyy") : "TBD"}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <MapPin className="w-3.5 h-3.5" /> Venue
                    </div>
                    <div className="text-sm font-semibold text-slate-700">{lead.venue || "TBD"}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Wallet className="w-3.5 h-3.5" /> Budget Range
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                       {lead.budget_min ? `₹${(lead.budget_min).toLocaleString()}` : "0"}
                       {lead.budget_max ? ` - ₹${(lead.budget_max).toLocaleString()}` : ""}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                      <Users className="w-3.5 h-3.5" /> Guests
                    </div>
                    <div className="text-sm font-semibold text-slate-700">{lead.guest_count_approx || "—"}</div>
                  </div>
               </div>
            </div>

            {/* Custom Form Data (Inquiry) */}
            {lead.form_data && Object.keys(lead.form_data).length > 0 && (
              <div className="space-y-4 pt-4">
                 <h4 className="text-sm font-bold text-slate-900 border-l-4 border-accent pl-3">Form Submission</h4>
                 <div className="bg-slate-50/50 rounded-xl p-4 border border-dashed border-slate-200 text-sm italic text-slate-600">
                    "{lead.notes || "No additional message provided."}"
                 </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="timeline">
            <LeadTimeline activities={lead.activities || []} />
          </TabsContent>

          <TabsContent value="notes">
             <div className="text-center py-12 text-slate-400 text-sm italic">
                Notes coming soon in real implementation.
             </div>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
