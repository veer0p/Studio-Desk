import Link from "next/link";
import { Plus, Search, ListFilter, Download, MoreHorizontal, ArrowUpRight, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { formatINR, formatIndianDate } from "@/lib/formatters";
import { InvoiceActionsMenu } from "@/components/invoices/InvoiceActionsMenu";
import { cn } from "@/lib/utils";

async function getInvoices() {
  // Mock invoices
  return [
    { 
      id: "INV-1", 
      invoice_number: "SD-FY2526-0001", 
      client: { full_name: "Priya Sharma", phone: "+91 98765 43210" }, 
      booking: { title: "Priya & Rahul Wedding" },
      type: "advance",
      total_amount: 59000,
      status: "paid",
      due_date: "2024-03-22"
    },
    { 
      id: "INV-2", 
      invoice_number: "SD-FY2526-0002", 
      client: { full_name: "Amit Patel", phone: "+91 88776 55432" }, 
      booking: { title: "Corporate Event - TCS" },
      type: "full",
      total_amount: 45000,
      status: "overdue",
      due_date: "2024-03-10"
    },
    { 
      id: "INV-3", 
      invoice_number: "SD-FY2526-0003", 
      client: { full_name: "Siddharth Malhotra", phone: "+91 99001 12233" }, 
      booking: { title: "Malhotra Family Portraits" },
      type: "balance",
      total_amount: 32000,
      status: "sent",
      due_date: "2024-03-25"
    }
  ];
}

export default async function InvoicesPage() {
  const invoices = await getInvoices();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Invoices</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage billing, GST invoices, and payments.</p>
        </div>
        <Button asChild className="bg-primary shadow-xl shadow-primary/20 h-11 px-6 rounded-xl font-bold">
           <Link href="/invoices/new">
              <Plus className="w-4 h-4 mr-2" /> Create Invoice
           </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: "Total Invoiced", value: 136000, color: "text-slate-900", bg: "bg-slate-50" },
           { label: "Collected", value: 59000, color: "text-emerald-600", bg: "bg-emerald-50/50" },
           { label: "Pending", value: 32000, color: "text-amber-600", bg: "bg-amber-50/50" },
           { label: "Overdue", value: 45000, color: "text-rose-600", bg: "bg-rose-50/50" },
         ].map((stat, i) => (
           <div key={i} className={cn("p-6 rounded-3xl border border-transparent shadow-sm", stat.bg)}>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</div>
              <div className={cn("text-2xl font-black tracking-tight", stat.color)}>{formatINR(stat.value)}</div>
           </div>
         ))}
      </div>

      <Tabs defaultValue="all" className="space-y-6">
         <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <TabsList className="bg-slate-100/50 p-1 rounded-2xl h-11 self-start">
               {["all", "draft", "sent", "paid", "overdue"].map((status) => (
                 <TabsTrigger 
                   key={status} 
                   value={status} 
                   className="rounded-xl px-6 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm"
                 >
                    {status} <Badge variant="secondary" className="ml-2 bg-slate-200/50 text-[9px] h-4 rounded-full px-1.5">3</Badge>
                 </TabsTrigger>
               ))}
            </TabsList>
            
            <div className="flex items-center gap-3 w-full md:w-auto">
               <div className="relative flex-1 md:w-64 group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
                  <Input placeholder="Invoice # or client..." className="pl-10 h-11 border-slate-200 rounded-xl" />
               </div>
               <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold px-6">
                  <ListFilter className="w-4 h-4 mr-2" /> Filter
               </Button>
            </div>
         </div>

         <TabsContent value="all" className="bg-white border border-slate-100 rounded-3xl overflow-hidden shadow-xl shadow-slate-200/50">
            <Table>
               <TableHeader className="bg-slate-50/50">
                  <TableRow className="border-b-slate-100 hover:bg-transparent">
                     <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 px-8">Invoice No.</TableHead>
                     <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Client</TableHead>
                     <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Type</TableHead>
                     <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Amount</TableHead>
                     <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Status</TableHead>
                     <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400">Due Date</TableHead>
                     <TableHead className="h-14 font-black text-[10px] uppercase tracking-widest text-slate-400 text-right pr-8">Actions</TableHead>
                  </TableRow>
               </TableHeader>
               <TableBody>
                  {invoices.map((inv) => (
                    <TableRow 
                      key={inv.id} 
                      className={cn(
                        "group border-b-slate-50 hover:bg-slate-50/50 transition-colors",
                        inv.status === 'overdue' && "bg-rose-50/30 hover:bg-rose-50/50"
                      )}
                    >
                       <TableCell className="px-8 flex items-center gap-3">
                          <Link href={`/invoices/${inv.id}`} className="font-mono font-bold text-slate-900 hover:text-primary transition-colors">
                             {inv.invoice_number}
                          </Link>
                          {inv.status === 'overdue' && <AlertCircle className="w-3 h-3 text-rose-500" />}
                       </TableCell>
                       <TableCell>
                          <div className="font-bold text-slate-900">{inv.client.full_name}</div>
                          <div className="text-[10px] font-medium text-slate-400">{inv.client.phone}</div>
                       </TableCell>
                       <TableCell>
                          <Badge variant="outline" className={cn(
                            "text-[9px] font-black uppercase tracking-tighter rounded-md border-none",
                            inv.type === 'advance' ? "bg-blue-50 text-blue-600" : 
                            inv.type === 'balance' ? "bg-teal-50 text-teal-600" : "bg-purple-50 text-purple-600"
                          )}>
                             {inv.type}
                          </Badge>
                       </TableCell>
                       <TableCell className="font-black text-slate-900">{formatINR(inv.total_amount)}</TableCell>
                       <TableCell>
                          <Badge className={cn(
                            "text-[9px] font-black uppercase rounded-full border-none px-3",
                            inv.status === 'paid' ? "bg-emerald-100 text-emerald-600" : 
                            inv.status === 'overdue' ? "bg-rose-500 text-white" : "bg-amber-100 text-amber-600"
                          )}>
                             {inv.status}
                          </Badge>
                       </TableCell>
                       <TableCell>
                          <div className={cn(
                            "text-xs font-bold",
                            inv.status === 'overdue' ? "text-rose-600" : "text-slate-500"
                          )}>
                             {formatIndianDate(inv.due_date)}
                          </div>
                       </TableCell>
                       <TableCell className="text-right pr-8">
                          <InvoiceActionsMenu invoice={inv as any} />
                       </TableCell>
                    </TableRow>
                  ))}
               </TableBody>
            </Table>
         </TabsContent>
      </Tabs>
    </div>
  );
}
