import Link from "next/link";
import { 
  Search, 
  ListFilter, 
  Download, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle,
  XCircle,
  Clock,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatINR, formatIndianDateTime } from "@/lib/formatters";
import { PaymentMethodBadge } from "@/components/payments/PaymentMethodBadge";
import { cn } from "@/lib/utils";

async function getPayments() {
  // Mock payments
  return [
    { 
      id: "PAY-1", 
      invoice_number: "SD-FY2526-0001",
      amount: 59000,
      method: "upi",
      status: "captured",
      reference: "RZP_123456789",
      created_at: "2024-03-16T14:30:00",
      client: "Priya Sharma"
    },
    { 
      id: "PAY-2", 
      invoice_number: "SD-FY2526-0004",
      amount: 25000,
      method: "cash",
      status: "captured",
      reference: "Manual-001",
      created_at: "2024-03-15T11:00:00",
      client: "Amit Patel"
    },
    { 
      id: "PAY-3", 
      invoice_number: "SD-FY2526-0002",
      amount: 45000,
      method: "card",
      status: "failed",
      reference: "RZP_99887766",
      created_at: "2024-03-14T18:20:00",
      client: "Siddharth Malhotra"
    }
  ];
}

export default async function PaymentsPage() {
  const payments = await getPayments();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Payment History</h1>
          <p className="text-sm text-muted-foreground mt-1">Audit log of all transactions across all bookings.</p>
        </div>
        <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-200">
           <Download className="w-4 h-4 mr-2" /> Export CSV
        </Button>
      </div>

      <div className="flex items-center gap-3">
         <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search ref, status, or client..." className="pl-10 h-11 border-slate-200 rounded-xl" />
         </div>
         <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold px-6">
            <ListFilter className="w-4 h-4 mr-2" /> Filter
         </Button>
      </div>

      <div className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
         <Table>
            <TableHeader className="bg-slate-50/50">
               <TableRow className="border-b-slate-100 hover:bg-transparent">
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 px-8">Date & Time</TableHead>
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Invoice</TableHead>
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Client</TableHead>
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Method</TableHead>
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Reference</TableHead>
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Amount</TableHead>
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
                  <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-8">Detail</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {payments.map((p) => (
                 <TableRow key={p.id} className="group border-b-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-8 whitespace-nowrap">
                       <div className="text-xs font-bold text-slate-900">{formatIndianDateTime(p.created_at).split(',')[0]}</div>
                       <div className="text-[10px] text-slate-400 uppercase font-medium">{formatIndianDateTime(p.created_at).split(',')[1]}</div>
                    </TableCell>
                    <TableCell className="font-mono text-xs font-bold text-slate-500">{p.invoice_number}</TableCell>
                    <TableCell className="font-bold text-slate-900">{p.client}</TableCell>
                    <TableCell>
                       <PaymentMethodBadge method={p.method} />
                    </TableCell>
                    <TableCell className="font-mono text-[10px] text-slate-400 truncate max-w-[120px]">{p.reference}</TableCell>
                    <TableCell className="font-black text-slate-900">{formatINR(p.amount)}</TableCell>
                    <TableCell>
                       <div className="flex items-center gap-2">
                          {p.status === 'captured' ? (
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                          ) : p.status === 'failed' ? (
                            <XCircle className="w-3.5 h-3.5 text-rose-500" />
                          ) : (
                            <Clock className="w-3.5 h-3.5 text-amber-500" />
                          )}
                          <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest",
                            p.status === 'captured' ? "text-emerald-600" : 
                            p.status === 'failed' ? "text-rose-600" : "text-amber-600"
                          )}>
                             {p.status}
                          </span>
                       </div>
                    </TableCell>
                    <TableCell className="text-right pr-8">
                       <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full border border-slate-100 opacity-0 group-hover:opacity-100 transition-all shadow-sm">
                          <ArrowUpRight className="w-4 h-4" />
                       </Button>
                    </TableCell>
                 </TableRow>
               ))}
            </TableBody>
         </Table>
      </div>
    </div>
  );
}
