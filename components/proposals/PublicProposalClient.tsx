"use client";

import { useState } from "react";
import { 
  CheckCircle2, 
  MessageCircle, 
  Package,
  AlertCircle,
  ArrowRight,
} from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RequestChangesSheet } from "@/components/proposals/RequestChangesSheet";

export default function PublicProposalClient({ proposal, token }: { proposal: any, token: string }) {
  const router = useRouter();
  const [isAccepted, setIsAccepted] = useState(false);
  const [isRequestSheetOpen, setIsRequestSheetOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const daysRemaining = Math.max(0, Math.ceil((new Date(proposal.valid_until).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)));

  const handleAccept = async () => {
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      setIsAccepted(true);
      toast.success("Proposal accepted! Redirecting to contract...");
      
      setTimeout(() => {
        router.push(`/contract/mock-token-redir`);
      }, 3000);
    } catch (error) {
      toast.error("Failed to accept proposal");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isAccepted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-slate-50">
        <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
           <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center text-white mx-auto shadow-xl shadow-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
           </div>
           <div className="space-y-2">
              <h1 className="text-3xl font-black text-slate-900 tracking-tight">Proposal Accepted!</h1>
              <p className="text-slate-500">Thank you for choosing {proposal.studio.name}. We&apos;re excited to work with you.</p>
           </div>
           <Card className="border-emerald-100 bg-white shadow-lg overflow-hidden">
              <CardContent className="p-6 space-y-4">
                 <div className="text-xs font-bold uppercase tracking-widest text-slate-400">Next Step</div>
                 <h3 className="text-lg font-bold text-slate-900">Sign the Contract</h3>
                 <p className="text-sm text-slate-500">We&apos;ve generated your service agreement. Please review and sign it electronically to confirm your booking.</p>
                 <Button className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 shadow-lg shadow-emerald-200" onClick={() => router.push('/contract/mock-token')}>
                    Go to Contract <ArrowRight className="w-4 h-4 ml-2" />
                 </Button>
              </CardContent>
           </Card>
           <p className="text-[10px] text-slate-400 uppercase font-black">Redirecting you automatically...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 md:py-24 space-y-12">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white text-2xl font-black mx-auto shadow-xl">
           {proposal.studio.name.charAt(0)}
        </div>
        <div>
           <h2 className="text-xl font-bold text-slate-900">{proposal.studio.name}</h2>
           <p className="text-sm text-slate-500 font-medium italic">{proposal.studio.tagline}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
         <div className="lg:col-span-2 space-y-8">
            <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-3xl overflow-hidden">
               <div className="bg-slate-900 p-8 md:p-12 text-white">
                  <div className="flex justify-between items-start mb-12">
                     <Badge variant="secondary" className="bg-white/10 text-white border-none backdrop-blur-md px-3 py-1 font-bold text-[10px] uppercase tracking-widest">Photography Proposal</Badge>
                     <div className="text-right">
                        <div className="text-xs font-bold text-slate-400 uppercase">Valid Until</div>
                        <div className="text-sm font-bold text-amber-400">{format(new Date(proposal.valid_until), "MMM d, yyyy")} ({daysRemaining} days left)</div>
                     </div>
                  </div>
                  
                  <h1 className="text-3xl md:text-5xl font-black tracking-tighter mb-6">{proposal.booking.title}</h1>
                  
                  <div className="grid grid-cols-2 gap-8 pt-8 border-t border-white/10">
                     <div className="space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prepared For</div>
                        <div className="text-lg font-bold">{proposal.client.full_name}</div>
                     </div>
                     <div className="text-right space-y-1">
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Event Date</div>
                        <div className="text-lg font-bold">{format(new Date(proposal.booking.event_date), "MMMM d, yyyy")}</div>
                     </div>
                  </div>
               </div>

               <CardContent className="p-8 md:p-12 space-y-12">
                  <div className="space-y-6">
                     <h3 className="flex items-center gap-2 text-sm font-black uppercase tracking-widest text-slate-400">
                        <Package className="w-4 h-4" /> Services & Inclusions
                     </h3>
                     <table className="w-full">
                        <tbody className="divide-y divide-slate-100">
                           {proposal.line_items.map((item: any) => (
                             <tr key={item.id} className="group">
                                <td className="py-6">
                                   <div className="font-bold text-slate-900 text-lg">{item.name}</div>
                                   <div className="text-sm text-slate-500 mt-1 leading-relaxed">{item.description}</div>
                                </td>
                                <td className="py-6 text-right align-top pt-7">
                                   <div className="font-black text-slate-900 text-xl">₹{item.unit_price.toLocaleString()}</div>
                                </td>
                             </tr>
                           ))}
                        </tbody>
                     </table>
                  </div>

                  <div className="bg-slate-50 rounded-3xl p-8 space-y-6">
                     <div className="flex justify-between items-center text-slate-500 font-medium">
                        <span>Project Subtotal</span>
                        <span>₹{proposal.total_amount.toLocaleString()}</span>
                     </div>
                     <div className="flex justify-between items-center text-slate-500 font-medium">
                        <span>Taxes (GST 18%)</span>
                        <Badge variant="outline" className="border-slate-200 text-[10px]">INCLUDED</Badge>
                     </div>
                     <Separator className="bg-slate-200" />
                     <div className="flex justify-between items-center">
                        <span className="text-xl font-black text-slate-900">Total Investment</span>
                        <span className="text-3xl font-black text-slate-900 tracking-tighter">₹{proposal.total_amount.toLocaleString()}</span>
                     </div>
                  </div>

                  {proposal.notes && (
                    <div className="space-y-4">
                       <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Special Terms</h3>
                       <div className="text-sm text-slate-600 leading-relaxed bg-amber-50/50 p-6 rounded-2xl border border-amber-100/50 italic">
                          &ldquo;{proposal.notes}&rdquo;
                       </div>
                    </div>
                  )}
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-12">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden p-8 space-y-8">
               <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900">Ready to Book?</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">Accept this proposal to secure your date and receive the service agreement.</p>
               </div>

               <div className="space-y-4 pt-4 border-t">
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">Booking Deposit</span>
                     <span className="font-bold text-slate-900">₹{proposal.advance_amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                     <span className="text-slate-500 font-medium">Package Total</span>
                     <span className="font-bold text-slate-900">₹{proposal.total_amount.toLocaleString()}</span>
                  </div>
               </div>

               <div className="space-y-3 pt-4">
                  <Button 
                    className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-lg font-bold shadow-xl shadow-emerald-200 rounded-2xl"
                    onClick={handleAccept}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Processing..." : "Accept Proposal"}
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full h-12 text-slate-400 hover:text-slate-900 font-bold"
                    onClick={() => setIsRequestSheetOpen(true)}
                  >
                    Request Changes
                  </Button>
               </div>

               <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl">
                  <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm text-primary shrink-0">
                     <AlertCircle className="w-4 h-4" />
                  </div>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-tight">
                    Secure 256-bit SSL encrypted acceptance.
                  </p>
               </div>
            </Card>

            <div className="px-4 text-center space-y-4">
               <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Questions about this proposal?</p>
               <Button variant="outline" className="h-10 px-6 rounded-full text-xs font-bold border-slate-200">
                  <MessageCircle className="w-3.5 h-3.5 mr-2 text-emerald-500" /> WhatsApp Studio
               </Button>
            </div>
         </div>
      </div>

      <div className="pt-12 text-center opacity-30 select-none pointer-events-none">
         <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-4">Powered by StudioDesk</p>
         <div className="flex justify-center gap-4 text-[10px] font-bold uppercase tracking-widest">
            <span>© 2024 Pixel Perfection</span>
            <span>•</span>
            <span>Terms of Service</span>
         </div>
      </div>

      <RequestChangesSheet 
        open={isRequestSheetOpen} 
        onOpenChange={setIsRequestSheetOpen} 
        token={token}
        onSuccess={() => {
           setIsRequestSheetOpen(false);
           toast.success("Request sent to studio!");
        }}
      />
    </div>
  );
}
