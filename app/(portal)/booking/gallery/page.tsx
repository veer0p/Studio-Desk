"use client";

import { usePortalSession } from "@/lib/portal/session";
import { SessionExpiredScreen } from "@/components/portal/SessionExpiredScreen";
import { 
  Camera, 
  Clock, 
  ChevronLeft, 
  Bell,
  Sparkles,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PortalGalleryPage() {
  const { session, isLoading, isValid } = usePortalSession();
  const router = useRouter();

  const gallery = {
    isPublished: false,
    slug: "priya-rahul-wedding",
    expectedDate: "Jan 15, 2026"
  };

  useEffect(() => {
    if (gallery.isPublished) {
      router.push(`/gallery/${gallery.slug}`);
    }
  }, [gallery, router]);

  if (isLoading) return null;
  if (!isValid) return <SessionExpiredScreen studio={session?.studio} />;

  return (
    <div className="space-y-10 pb-20">
      <div className="flex items-center gap-4">
         <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl bg-slate-50" asChild>
            <Link href="/booking">
               <ChevronLeft className="w-5 h-5 text-slate-400" />
            </Link>
         </Button>
         <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Access Gallery</h1>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Digital Memories</p>
         </div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-10 space-y-12 text-center">
         <div className="relative">
            <div className="w-40 h-40 bg-slate-900 rounded-[4rem] flex items-center justify-center text-white relative z-10 shadow-2xl">
               <Camera className="w-16 h-16 animate-pulse" />
            </div>
            {/* Shimmer CSS effect would go here */}
            <div className="absolute inset-0 bg-primary/20 rounded-[4rem] blur-2xl animate-pulse scale-125" />
            <div className="absolute top-0 right-0 mt-4 mr-4 w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-xl z-20 animate-bounce">
               <Sparkles className="w-6 h-6 text-primary" />
            </div>
         </div>

         <div className="space-y-4 max-w-xs">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">Your photos are being curated with love.</h2>
            <p className="text-sm text-slate-500 font-medium leading-relaxed">
               Our post-production team is busy hand-picking and color-grading your special moments.
            </p>
         </div>

         <div className="w-full space-y-6">
            <div className="bg-slate-50 rounded-[2.5rem] p-8 border border-slate-100 flex flex-col items-center gap-4">
               <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Estimated Delivery</p>
               </div>
               <p className="text-3xl font-black text-slate-900">{gallery.expectedDate}</p>
            </div>

            <div className="p-8 bg-blue-50/50 rounded-[2.5rem] border border-blue-100 space-y-4">
               <div className="flex items-center justify-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-primary shadow-sm">
                     <Bell className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-black text-blue-900 uppercase tracking-widest">Notification On</p>
               </div>
               <p className="text-[11px] font-bold text-blue-800/60 leading-relaxed italic">
                  We'll send you an automated WhatsApp & Email notification the moment your gallery goes live!
               </p>
            </div>
         </div>
      </div>

      <div className="bg-slate-50 rounded-3xl p-6 flex gap-4">
         <Info className="w-6 h-6 text-slate-300 shrink-0" />
         <p className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
            Expect a highlight gallery within 7 days of the shoot, with full delivery approximately 4 weeks later.
         </p>
      </div>
    </div>
  );
}
