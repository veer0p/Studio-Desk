import { notFound } from "next/navigation";
import { ProposalBuilder } from "@/components/proposals/ProposalBuilder";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle2, Clock, XCircle, Send, ExternalLink, Download } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { GSTBreakdown } from "@/components/proposals/GSTBreakdown";

async function getProposal(id: string) {
  // Mock proposal data
  return {
    id,
    version: 2,
    status: "sent", // or 'draft', 'accepted', 'rejected'
    total_amount: 59000,
    notes: "Includes all raw images and 50 edited photos.",
    advance_pct: 30,
    valid_until: "2024-03-24",
    created_at: "2024-03-10",
    viewed_at: "2024-03-11T14:30:00",
    line_items: [
      { id: "1", name: "Premium Wedding Photography", description: "Full day coverage", hsn: "998389", qty: 1, unit_price: 50000 },
    ],
    booking: {
      id: "B1",
      title: "Siddharth & Ananya Wedding",
      client: {
        full_name: "Siddharth Malhotra",
        email: "sid@example.com",
        phone: "+91 99999 00000",
        state: "Karnataka",
      }
    }
  };
}

export default async function ProposalDetailPage({ params }: { params: { id: string, proposalId: string } }) {
  const proposal = await getProposal(params.proposalId);

  if (!proposal) notFound();

  // If draft, show the builder
  if (proposal.status === 'draft') {
    return (
      <div className="space-y-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <Link href={`/bookings/${params.id}/proposals`}>
               <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Edit Proposal v{proposal.version}</h1>
        </div>
        <ProposalBuilder 
          booking={proposal.booking} 
          packages={[]} // Would fetch these
          addons={[]} 
        />
      </div>
    );
  }

  // Otherwise, show read-only view
  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <Link href={`/bookings/${params.id}/proposals`}>
               <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
               <h1 className="text-3xl font-bold tracking-tight">Proposal #{proposal.id}</h1>
               <Badge variant="outline" className="text-[10px] font-black">v{proposal.version}</Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Status: <span className="font-bold text-slate-900 uppercase">{proposal.status}</span></p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" /> Download PDF
           </Button>
           <Button size="sm">
              <Send className="w-4 h-4 mr-2" /> Resend to Client
           </Button>
        </div>
      </div>

      {/* Status Banners */}
      {proposal.status === "sent" && (
        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center text-white shrink-0">
                 <Clock className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-bold text-amber-900">Awaiting Client Review</h3>
                 <p className="text-sm text-amber-700/80">Sent on {new Date(proposal.created_at).toLocaleDateString()}. {proposal.viewed_at ? `Viewed by client ${new Date(proposal.viewed_at).toLocaleTimeString()}` : 'Not yet viewed.'}</p>
              </div>
           </div>
           <div className="flex gap-2">
              <Button variant="outline" size="sm" className="bg-white border-amber-200 text-amber-900 hover:bg-amber-50">
                 <ExternalLink className="w-4 h-4 mr-2" /> Share Link
              </Button>
           </div>
        </div>
      )}

      {proposal.status === "accepted" && (
        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
                 <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                 <h3 className="font-bold text-emerald-900">Proposal Accepted</h3>
                 <p className="text-sm text-emerald-700/80">Confirmed by {proposal.booking.client.full_name}. You can now generate a contract.</p>
              </div>
           </div>
           <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700" asChild>
              <Link href={`/bookings/${params.id}/contract/new?proposal=${proposal.id}`}>Create Contract</Link>
           </Button>
        </div>
      )}

      {/* Read-only Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-200">
               <CardHeader className="bg-slate-50/50">
                  <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-400">Services &Deliverables</CardTitle>
               </CardHeader>
               <CardContent className="p-0">
                  <table className="w-full">
                     <thead className="border-b bg-slate-50/30">
                        <tr>
                           <th className="px-6 py-3 text-left text-[10px] font-bold uppercase text-slate-400">Description</th>
                           <th className="px-6 py-3 text-center text-[10px] font-bold uppercase text-slate-400">Qty</th>
                           <th className="px-6 py-3 text-right text-[10px] font-bold uppercase text-slate-400">Amount</th>
                        </tr>
                     </thead>
                     <tbody className="divide-y">
                        {proposal.line_items.map((item) => (
                          <tr key={item.id}>
                             <td className="px-6 py-4">
                                <div className="font-bold text-slate-900">{item.name}</div>
                                <div className="text-xs text-slate-500">{item.description}</div>
                             </td>
                             <td className="px-6 py-4 text-center text-sm">{item.qty}</td>
                             <td className="px-6 py-4 text-right font-bold">₹{item.unit_price.toLocaleString()}</td>
                          </tr>
                        ))}
                     </tbody>
                  </table>
               </CardContent>
            </Card>

            <Card className="border-slate-200">
               <CardContent className="p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-slate-400">Notes & Terms</h3>
                  <div className="text-sm text-slate-600 leading-relaxed italic border-l-4 border-slate-200 pl-4 py-2">
                     {proposal.notes || "No special notes provided."}
                  </div>
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-1 space-y-6">
            <Card className="border-slate-200 overflow-hidden">
               <CardHeader className="bg-slate-900 text-white">
                  <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-400">Financial Summary</CardTitle>
               </CardHeader>
               <CardContent className="p-6">
                  <GSTBreakdown 
                    subtotal={proposal.total_amount} 
                    gstType="intra" 
                    studioState="Maharashtra" 
                    clientState={proposal.booking.client.state} 
                  />
                  
                  <Separator className="my-6" />
                  
                  <div className="space-y-4">
                     <h4 className="text-[10px] font-bold uppercase text-slate-400">Payment Breakdown</h4>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Advance ({proposal.advance_pct}%)</span>
                        <span className="text-sm font-bold">₹{(proposal.total_amount * (proposal.advance_pct/100)).toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">On Delivery ({100 - proposal.advance_pct}%)</span>
                        <span className="text-sm font-bold text-slate-400">₹{(proposal.total_amount * (1 - proposal.advance_pct/100)).toLocaleString()}</span>
                     </div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-slate-200">
               <CardContent className="p-6">
                  <h4 className="text-[10px] font-bold uppercase text-slate-400 mb-4">Tracking</h4>
                  <div className="space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                           <Calendar className="w-4 h-4" />
                        </div>
                        <div>
                           <div className="text-[10px] text-slate-400 font-bold uppercase">Valid Until</div>
                           <div className="text-sm font-bold">{format(new Date(proposal.valid_until), "MMM d, yyyy")}</div>
                        </div>
                     </div>
                  </div>
               </CardContent>
            </Card>
         </div>
      </div>
    </div>
  );
}
