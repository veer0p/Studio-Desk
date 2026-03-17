import { notFound } from "next/navigation";
import { ArrowLeft, Download, FileText, CheckCircle2, Clock } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ContractStatusBanner } from "@/components/contracts/ContractStatusBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

async function getContract(id: string) {
  // Mock contract data
  return {
    id,
    status: "sent", // or 'signed'
    created_at: "2024-03-12",
    viewed_at: "2024-03-13T10:15:00",
    signed_at: null,
    content_html: `
      <h1>Photography Services Agreement</h1>
      <p>This agreement is made between <strong>Pixel Perfection Studios</strong> and <strong>Siddharth Malhotra</strong>.</p>
      <p>The Studio is excited to document your <strong>Wedding</strong> at <strong>The Leela Palace</strong>.</p>
      <p>...</p>
    `,
    booking: {
      id: "B1",
      title: "Siddharth & Ananya Wedding",
      client: {
        full_name: "Siddharth Malhotra",
        email: "sid@example.com",
      }
    }
  };
}

export default async function ContractDetailPage({ params }: { params: { id: string, contractId: string } }) {
  const contract = await getContract(params.contractId);

  if (!contract) notFound();

  return (
    <div className="space-y-8 max-w-5xl">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full" asChild>
            <Link href={`/bookings/${params.id}`}>
               <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Contract Detail</h1>
            <p className="text-sm text-muted-foreground mt-1">Booking: {contract.booking.title}</p>
          </div>
        </div>
        
        <div className="flex gap-3">
           <Button variant="outline" size="sm" className="h-10 px-6 font-bold">
              <Download className="w-4 h-4 mr-2" /> PDF Preview
           </Button>
           <Button size="sm" className="bg-slate-900 hover:bg-slate-800 h-10 px-8 font-bold">
              Manage Versions
           </Button>
        </div>
      </div>

      <ContractStatusBanner 
        contract={contract} 
        client={contract.booking.client} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2">
            <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden bg-white">
               <CardHeader className="bg-slate-50/50 border-b p-8">
                  <CardTitle className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Agreement Content</CardTitle>
               </CardHeader>
               <CardContent className="p-8 md:p-12 overflow-auto max-h-[800px] scrollbar-hide">
                  <article 
                    className="prose prose-slate max-w-none 
                               prose-h1:text-4xl prose-h1:font-black prose-h1:mb-12
                               prose-p:text-slate-600 prose-p:leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: contract.content_html }}
                  />
               </CardContent>
            </Card>
         </div>

         <div className="lg:col-span-1 space-y-6">
            <Card className="border-none shadow-lg rounded-3xl bg-slate-900 text-white">
               <CardContent className="p-8 space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Signer Information</h3>
                  <div>
                     <div className="text-lg font-bold">{contract.booking.client.full_name}</div>
                     <div className="text-sm text-slate-400">{contract.booking.client.email}</div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-white/5 rounded-2xl border border-white/5">
                     <Clock className="w-4 h-4 text-emerald-400" />
                     <div className="text-[10px] font-bold uppercase tracking-widest">Awaiting Signature</div>
                  </div>
               </CardContent>
            </Card>

            <Card className="border-none shadow-lg rounded-3xl bg-white p-8 space-y-4">
               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Audit Log</h3>
               <div className="space-y-4 pt-2">
                  <div className="flex items-start gap-3">
                     <div className="w-2 h-2 rounded-full bg-slate-200 mt-1.5 shrink-0" />
                     <div>
                        <div className="text-xs font-bold text-slate-900">Contract Generated</div>
                        <div className="text-[10px] text-slate-400">by Admin • {format(new Date(contract.created_at), "MMM d, h:mm a")}</div>
                     </div>
                  </div>
                  <div className="flex items-start gap-3">
                     <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 shadow-lg shadow-emerald-200 animate-pulse" />
                     <div>
                        <div className="text-xs font-bold text-emerald-600">Viewed by Client</div>
                        <div className="text-[10px] text-slate-400">IP: 152.12.XXX.XX • {format(new Date(contract.viewed_at || ""), "MMM d, h:mm a")}</div>
                     </div>
                  </div>
               </div>
            </Card>
         </div>
      </div>
    </div>
  );
}
