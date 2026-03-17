"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useState } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { toast } from "sonner";

const inquirySchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().min(10, "Invalid phone number"),
  event_type: z.string().min(1, "Please select an event type"),
  event_date: z.string().optional(),
  venue: z.string().optional(),
  message: z.string().optional(),
});

export default function InquiryForm({ studio, config }: { studio: any; config: any }) {
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const form = useForm<z.infer<typeof inquirySchema>>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      event_type: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof inquirySchema>) => {
    try {
      const res = await fetch("/api/inquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...values,
          studio_id: studio.id,
          source: "inquiry_form",
        }),
      });

      if (!res.ok) throw new Error("Failed to submit");

      setIsSubmitted(true);
      toast.success("Inquiry sent successfully!");
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    }
  };

  if (isSubmitted) {
    return (
      <div className="flex flex-col items-center justify-center text-center space-y-4 py-12 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-4">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">Thank You!</h2>
        <p className="text-slate-500 max-w-sm">
          Your inquiry for <span className="font-bold text-slate-800">{studio.name}</span> has been received. 
          We'll get back to you shortly.
        </p>
        <div className="pt-8">
           <Button variant="outline" onClick={() => setIsSubmitted(false)}>Send another inquiry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden max-w-2xl mx-auto">
      <div className="p-8 md:p-12 border-b border-slate-50">
         <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
           {config.form_title || "Book Your Session"}
         </h1>
         <p className="text-slate-500 mt-2">
           Tell us about your event and we'll reach out with a personalized quote.
         </p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="p-8 md:p-12 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div className="space-y-2">
             <Label htmlFor="full_name">Full Name</Label>
             <Input id="full_name" {...form.register("full_name")} placeholder="Your name" className="bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all" />
             {form.formState.errors.full_name && <p className="text-xs text-rose-500 font-medium">{form.formState.errors.full_name.message}</p>}
           </div>
           <div className="space-y-2">
             <Label htmlFor="phone">Phone Number</Label>
             <Input id="phone" {...form.register("phone")} placeholder="9876543210" className="bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all" />
             {form.formState.errors.phone && <p className="text-xs text-rose-500 font-medium">{form.formState.errors.phone.message}</p>}
           </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email Address</Label>
          <Input id="email" {...form.register("email")} placeholder="you@example.com" className="bg-slate-50 border-transparent focus:bg-white focus:border-primary transition-all" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {config.show_event_type && (
             <div className="space-y-2">
               <Label>Event Type</Label>
               <Select onValueChange={(v) => form.setValue("event_type", v)}>
                 <SelectTrigger className="bg-slate-50 border-transparent">
                   <SelectValue placeholder="Select type" />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="wedding">Wedding</SelectItem>
                   <SelectItem value="engagement">Engagement</SelectItem>
                   <SelectItem value="pre_wedding">Pre-Wedding</SelectItem>
                   <SelectItem value="portrait">Family Portrait</SelectItem>
                   <SelectItem value="event">Corporate Event</SelectItem>
                   <SelectItem value="other">Other</SelectItem>
                 </SelectContent>
               </Select>
               {form.formState.errors.event_type && <p className="text-xs text-rose-500 font-medium">{form.formState.errors.event_type.message}</p>}
             </div>
           )}

           {config.show_event_date && (
             <div className="space-y-2">
               <Label htmlFor="event_date">Event Date</Label>
               <Input id="event_date" type="date" {...form.register("event_date")} className="bg-slate-50 border-transparent" />
             </div>
           )}
        </div>

        {config.show_venue && (
          <div className="space-y-2">
            <Label htmlFor="venue">Venue / City</Label>
            <Input id="venue" {...form.register("venue")} placeholder="Where is it happening?" className="bg-slate-50 border-transparent" />
          </div>
        )}

        {config.show_message && (
          <div className="space-y-2">
            <Label htmlFor="message">Any specific requests?</Label>
            <Textarea id="message" {...form.register("message")} placeholder="Tell us more about your vision..." className="bg-slate-50 border-transparent min-h-[100px]" />
          </div>
        )}

        <div className="pt-4">
           <Button type="submit" className="w-full h-14 text-lg font-bold bg-[#1A3C5E] hover:bg-[#122b44] rounded-xl shadow-lg shadow-[#1A3C5E]/20" disabled={form.formState.isSubmitting}>
             {form.formState.isSubmitting ? (
               <>
                 <Loader2 className="w-5 h-5 mr-2 animate-spin" /> Sending...
               </>
             ) : (
               <>
                 {config.button_text || "Send Inquiry"} <Send className="w-5 h-5 ml-2" />
               </>
             )}
           </Button>
           <p className="text-center text-[10px] text-slate-400 mt-6 uppercase tracking-widest font-bold">
             Powered by StudioDesk
           </p>
        </div>
      </form>
    </div>
  );
}
