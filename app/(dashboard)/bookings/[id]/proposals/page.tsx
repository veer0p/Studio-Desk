"use client";

import { useState } from "react";
import { 
  Plus, 
  History, 
  FileText, 
  ChevronRight, 
  MoreVertical,
  Calendar,
  Eye,
  Send,
  CheckCircle2,
  Clock,
  AlertCircle,
  Edit,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/leads/StatusBadge"; // Reuse or create specialized

export default function ProposalsPage({ params }: { params: { id: string } }) {
  // Mock data for proposals
  const [proposals] = useState([
    { 
      id: "P1", 
      version: 2, 
      status: "sent", 
      total_amount: 59000, 
      created_at: "2024-03-10", 
      viewed_at: "2024-03-11T14:30:00",
      line_items_count: 3 
    },
    { 
      id: "P0", 
      version: 1, 
      status: "rejected", 
      total_amount: 45000, 
      created_at: "2024-03-05", 
      viewed_at: "2024-03-05T10:00:00",
      line_items_count: 2 
    }
  ]);

  return (
    <div className="space-y-8 max-w-4xl">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Proposals</h1>
          <p className="text-sm text-muted-foreground mt-1">Version history and status for this booking.</p>
        </div>
        <Button size="sm" asChild>
          <Link href={`/bookings/${params.id}/proposal/new`}>
            <Plus className="w-4 h-4 mr-2" /> New Proposal
          </Link>
        </Button>
      </div>

      <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
        {proposals.map((proposal) => (
          <div key={proposal.id} className="relative flex items-start gap-6 group">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-white shadow-sm ring-1 ${
              proposal.status === 'accepted' ? 'bg-emerald-500 ring-emerald-200' :
              proposal.status === 'sent' ? 'bg-amber-500 ring-amber-200' :
              proposal.status === 'rejected' ? 'bg-rose-500 ring-rose-200' : 'bg-slate-500 ring-slate-200'
            }`}>
               {proposal.status === 'accepted' ? <CheckCircle2 className="h-5 w-5 text-white" /> : 
                proposal.status === 'sent' ? <Clock className="h-5 w-5 text-white" /> : 
                <FileText className="h-5 w-5 text-white" />}
            </div>

            <Card className="flex-1 hover:border-primary transition-all cursor-pointer">
              <CardContent className="p-6">
                 <div className="flex justify-between items-start mb-6">
                    <div className="space-y-1">
                       <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-[10px] font-black">v{proposal.version}</Badge>
                          <h3 className="font-bold text-slate-900">Proposal #{proposal.id}</h3>
                       </div>
                       <div className="text-xs text-slate-400 flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> {format(new Date(proposal.created_at), "MMM d, yyyy")}
                       </div>
                    </div>
                    <div className="text-right">
                       <div className="text-xl font-black text-slate-900">₹{(proposal.total_amount).toLocaleString()}</div>
                       <div className="text-[10px] uppercase font-bold text-slate-500">{proposal.status}</div>
                    </div>
                 </div>

                 <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                    <div className="flex items-center gap-4">
                       <div className="flex items-center gap-1.5 text-xs text-slate-500">
                          <FileText className="w-3.5 h-3.5" /> {proposal.line_items_count} items
                       </div>
                       {proposal.viewed_at ? (
                         <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
                            <Eye className="w-3.5 h-3.5" /> Viewed {format(new Date(proposal.viewed_at), "MMM d, h:mm a")}
                         </div>
                       ) : (
                         <div className="flex items-center gap-1.5 text-xs text-slate-400">
                            <Eye className="w-3.5 h-3.5" /> Not yet viewed
                         </div>
                       )}
                    </div>

                    <div className="flex gap-2">
                       <Button variant="ghost" size="sm" className="h-8 text-xs underline" asChild>
                          <Link href={`/bookings/${params.id}/proposal/${proposal.id}`}>View Details</Link>
                       </Button>
                       <Button variant="outline" size="icon" className="h-8 w-8">
                          <MoreVertical className="w-4 h-4" />
                       </Button>
                    </div>
                 </div>
              </CardContent>
            </Card>
          </div>
        ))}
        
        {proposals.length === 0 && (
          <div className="text-center py-20 bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-100">
             <AlertCircle className="w-10 h-10 text-slate-200 mx-auto mb-4" />
             <h3 className="text-sm font-bold text-slate-900">No Proposals Yet</h3>
             <p className="text-xs text-slate-400 mt-1 max-w-[200px] mx-auto">Create a proposal to start the booking process.</p>
             <Button size="sm" variant="outline" className="mt-6" asChild>
                <Link href={`/bookings/${params.id}/proposal/new`}>
                  <Plus className="w-4 h-4 mr-2" /> Create First Proposal
                </Link>
             </Button>
          </div>
        )}
      </div>
    </div>
  );
}
