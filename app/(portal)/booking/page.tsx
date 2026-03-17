"use client";

import { usePortalSession } from "@/lib/portal/session";
import { SessionExpiredScreen } from "@/components/portal/SessionExpiredScreen";
import { 
  Calendar, 
  MapPin, 
  FileText, 
  CreditCard, 
  Image as ImageIcon, 
  HelpCircle,
  ChevronRight,
  CheckCircle2,
  Clock,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function PortalBookingPage() {
  const { session, isLoading, isValid } = usePortalSession();

  if (isLoading) return null; // Handled by layout/spinner or just wait
  if (!isValid) return <SessionExpiredScreen studio={session?.studio} />;

  const booking = {
    title: "Priya & Rahul Wedding",
    type: "Wedding Photography",
    date: "Dec 25, 2025",
    venue: "The Leela Palace, Udaipur",
    status: "contract_signed", // current stage
    contract_status: "signed",
    payment_status: "partial",
    payment_amount: 124500,
    gallery_status: "not_published",
    questions_status: "not_submitted",
    photo_count: 0
  };

  const stages = [
    { label: "Confirmed", status: "completed" },
    { label: "Contract", status: "current" },
    { label: "Paid", status: "upcoming" },
    { label: "Shoot", status: "upcoming" },
    { label: "Gallery", status: "upcoming" }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-1000">
      {/* Studio Header */}
      <div className="text-center space-y-4">
         <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] mx-auto flex items-center justify-center overflow-hidden border-4 border-white shadow-xl">
            {session?.studio.logo_url ? (
              <img src={session.studio.logo_url} alt={session.studio.name} className="w-full h-full object-cover" />
            ) : (
              <span className="text-2xl font-black text-primary">{session?.studio.name[0]}</span>
            )}
         </div>
         <div className="space-y-1">
            <h1 className="text-lg font-black text-slate-900 tracking-tight">Your booking with {session?.studio.name}</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Secure Client Portal</p>
         </div>
      </div>

      {/* Booking Summary Card */}
      <div className="bg-slate-900 rounded-[3rem] p-8 text-white shadow-2xl shadow-slate-200 relative overflow-hidden group">
         <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 group-hover:scale-110 transition-transform duration-700" />
         <div className="relative z-10 space-y-6">
            <div className="space-y-2">
               <Badge className="bg-white/10 text-white border-none py-1 px-3 text-[10px] font-bold">
                  {booking.type}
               </Badge>
               <h2 className="text-3xl font-black tracking-tight">{booking.title}</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
               <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold opacity-80">{booking.date}</span>
               </div>
               <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm font-bold opacity-80 truncate">{booking.venue.split(',')[0]}</span>
               </div>
            </div>

            <div className="pt-4 space-y-3">
               <div className="flex justify-between text-[10px] font-black uppercase tracking-widest opacity-40">
                  <span>Booking Progress</span>
                  <span>40%</span>
               </div>
               <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-primary w-[40%] rounded-full shadow-[0_0_12px_rgba(42,126,200,0.5)]" />
               </div>
               <div className="flex justify-between items-center px-1">
                  {stages.map((s, i) => (
                    <div key={s.label} className="flex flex-col items-center gap-2">
                       <div className={cn(
                         "w-1.5 h-1.5 rounded-full transition-all duration-500",
                         s.status === 'completed' ? "bg-emerald-400" : s.status === 'current' ? "bg-primary scale-150 shadow-[0_0_8px_rgba(42,126,200,1)]" : "bg-white/20"
                       )} />
                       <span className={cn(
                         "text-[8px] font-black uppercase tracking-tighter opacity-30",
                         s.status === 'current' && "opacity-100 text-primary"
                       )}>{s.label}</span>
                    </div>
                  ))}
               </div>
            </div>
         </div>
      </div>

      {/* Action Cards Grid */}
      <div className="grid grid-cols-2 gap-4">
         {/* Contract Card */}
         <Link href="/booking/contract" className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-48">
            <div className="w-10 h-10 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
               <FileText className="w-5 h-5" />
            </div>
            <div className="space-y-4">
               <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Contract</h3>
                  <p className="font-black text-slate-900 mt-1">
                     {booking.contract_status === 'signed' ? 'Signed ✓' : 'Unsigned'}
                  </p>
               </div>
               <div className={cn(
                 "h-8 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-colors",
                 booking.contract_status === 'signed' ? "bg-slate-50 text-slate-400" : "bg-primary text-white shadow-lg shadow-primary/20"
               )}>
                  {booking.contract_status === 'signed' ? 'View' : 'Sign Now'}
               </div>
            </div>
         </Link>

         {/* Payment Card */}
         <Link href="/booking/payment" className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-48">
            <div className="w-10 h-10 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
               <CreditCard className="w-5 h-5" />
            </div>
            <div className="space-y-4">
               <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Payment</h3>
                  <p className="font-black text-slate-900 mt-1">₹{booking.payment_amount.toLocaleString('en-IN')}</p>
               </div>
               <div className={cn(
                 "h-8 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest",
                 booking.payment_status === 'paid' ? "bg-slate-50 text-slate-400" : "bg-emerald-500 text-white shadow-lg shadow-emerald-200"
               )}>
                  {booking.payment_status === 'paid' ? 'Receipt' : 'Pay Now'}
               </div>
            </div>
         </Link>

         {/* Gallery Card */}
         <Link href="/booking/gallery" className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-48">
            <div className="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
               <ImageIcon className="w-5 h-5" />
            </div>
            <div className="space-y-4">
               <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Gallery</h3>
                  <p className="font-black text-slate-900 mt-1">Not Ready</p>
               </div>
               <div className="h-8 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest bg-slate-50 text-slate-300">
                  Coming Soon
               </div>
            </div>
         </Link>

         {/* Questionnaire Card */}
         <Link href="/booking/questionnaire" className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-48">
            <div className="w-10 h-10 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
               <HelpCircle className="w-5 h-5" />
            </div>
            <div className="space-y-4">
               <div>
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">Shoot Details</h3>
                  <p className="font-black text-slate-900 mt-1">Submit Info</p>
               </div>
               <div className="h-8 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest bg-slate-900 text-white shadow-lg shadow-slate-200">
                  Update
               </div>
            </div>
         </Link>
      </div>

      {/* Booking Tracker Message */}
      <div className="bg-blue-50/50 rounded-3xl p-6 border border-blue-100 flex gap-4">
         <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-primary shadow-sm shrink-0">
            <Clock className="w-6 h-6" />
         </div>
         <div className="space-y-1">
            <p className="text-xs font-black text-slate-900">Next Step: Sign Contract</p>
            <p className="text-[10px] font-medium text-slate-500 leading-relaxed">
               Please review and sign your photography contract to confirm your dates. Advance payment is required after signing.
            </p>
         </div>
      </div>
    </div>
  );
}
