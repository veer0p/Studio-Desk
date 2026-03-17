"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Send, Sparkles, AlertCircle, Info } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InvoiceForm } from "@/components/invoices/InvoiceForm";

export default function NewInvoicePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking_id");
  const typeParam = searchParams.get("type") as any;
  
  const [isLoading, setIsLoading] = useState(true);
  const [booking, setBooking] = useState<any>(null);

  useEffect(() => {
    // Only fetch if bookingId provided, else redirect or show selection
    if (bookingId) {
      setTimeout(() => {
        setBooking({
          id: bookingId,
          title: "Siddharth & Ananya Wedding",
          client_state: "Maharashtra",
          studio_state: "Maharashtra",
          total_amount: 150000,
          amount_paid: 25000,
          package_snapshot: {
            items: [
              { id: "p1", name: "Modern Wedding Package", price: 150000 }
            ]
          }
        });
        setIsLoading(false);
      }, 1000);
    } else {
      setIsLoading(false);
    }
  }, [bookingId]);

  const handleSave = async (data: any) => {
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success("Invoice created successfully!");
      router.push("/invoices");
    } catch (error) {
      toast.error("Failed to create invoice");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
         <div className="animate-spin w-8 h-8 border-4 border-slate-900 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!bookingId) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center space-y-8 animate-in fade-in slide-in-from-bottom-8">
         <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center text-white mx-auto shadow-2xl">
            <Sparkles className="w-10 h-10" />
         </div>
         <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Create New Invoice</h1>
            <p className="text-slate-500">Select a booking to generate an invoice for. We&apos;ll auto-populate the details.</p>
         </div>
         <Button className="h-14 px-12 rounded-2xl bg-slate-900 font-bold shadow-xl" asChild>
            <Link href="/leads">Browse Bookings</Link>
         </Button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full shadow-sm" asChild>
            <Link href={`/bookings/${bookingId}`}>
               <ArrowLeft className="w-4 h-4" />
            </Link>
          </Button>
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">Draft New Invoice</h1>
            <div className="flex items-center gap-2">
               <Badge variant="secondary" className="bg-primary/10 text-primary border-none text-[9px] uppercase font-black px-2">{booking.title}</Badge>
               <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">• Booking #{bookingId.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </div>

      <InvoiceForm 
        booking={booking} 
        existingInvoices={[]} 
        invoiceType={typeParam || 'full'}
        onSave={handleSave} 
      />
    </div>
  );
}
