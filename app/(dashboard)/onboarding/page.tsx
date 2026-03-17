"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { 
  Loader2, 
  ChevronRight, 
  ChevronLeft, 
  Upload, 
  CheckCircle2, 
  Building2, 
  Smartphone,
  Globe,
  Palette,
  CreditCard,
  Users as UsersIcon,
  PartyPopper
} from "lucide-react";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { INDIAN_STATES } from "@/lib/constants";
import { useCurrentStudio } from "@/hooks/use-current-studio";

const step1Schema = z.object({
  name: z.string().min(2, "Studio name is required"),
  tagline: z.string().optional(),
  brand_color: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").default("#1A3C5E"),
  phone: z.string().min(10, "Valid phone number is required"),
  city: z.string().min(2, "City is required"),
  state: z.string().min(2, "State is required"),
});

const step2Schema = z.object({
  gstin: z.string().regex(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/, "Invalid GSTIN format").optional().or(z.literal("")),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format").optional().or(z.literal("")),
  business_address: z.string().min(5, "Full address is required"),
});

const step3Schema = z.object({
  razorpay_key_id: z.string().optional(),
  razorpay_key_secret: z.string().optional(),
  invoice_prefix: z.string().min(1).default("SD"),
  default_advance_pct: z.number().min(10).max(100).default(30),
});

type Step3Values = z.infer<typeof step3Schema>;

export default function OnboardingPage() {
  const router = useRouter();
  const { studio, member, refresh } = useCurrentStudio();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const supabase = createClient();

const step1Form = useForm<z.infer<typeof step1Schema>>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      name: studio?.name || "",
      brand_color: "#1A3C5E",
    }
  });

  const step2Form = useForm<z.infer<typeof step2Schema>>({
    resolver: zodResolver(step2Schema)
  });

  const step3Form = useForm<Step3Values>({
    resolver: zodResolver(step3Schema),
    defaultValues: {
      invoice_prefix: "SD",
      default_advance_pct: 30
    }
  });

  const handleNext = async () => {
    setIsLoading(true);
    try {
      if (step === 1) {
        const values = await step1Form.trigger();
        if (!values) return;
        
        let logo_url = studio?.logo_url;
        if (logoFile) {
          const fileExt = logoFile.name.split('.').pop();
          const fileName = `${studio?.id}/logo.${fileExt}`;
          const { data, error } = await supabase.storage
            .from('studio-assets')
            .upload(fileName, logoFile, { upsert: true });
          
          if (error) throw error;
          const { data: { publicUrl } } = supabase.storage.from('studio-assets').getPublicUrl(fileName);
          logo_url = publicUrl;
        }

        const res = await fetch("/api/settings/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studio: { ...step1Form.getValues(), logo_url }
          })
        });
        if (!res.ok) throw new Error("Failed to save profile");
      }

      if (step === 2) {
        const values = await step2Form.trigger();
        if (!values) return;
        const res = await fetch("/api/settings/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studio: step2Form.getValues()
          })
        });
        if (!res.ok) throw new Error("Failed to save business details");
      }

      if (step === 3) {
        const values = await step3Form.trigger();
        if (!values) return;
        const formValues = step3Form.getValues() as Step3Values;
        const { razorpay_key_id, razorpay_key_secret, ...rest } = formValues;
        
        if (razorpay_key_id && razorpay_key_secret) {
          await fetch("/api/settings/connections/razorpay", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ razorpay_key_id, razorpay_key_secret })
          });
        }

        await fetch("/api/settings/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ studio: rest })
        });
      }

      setStep(s => s + 1);
    } catch (error: any) {
      toast.error(error.message || "Failed to save step");
    } finally {
      setIsLoading(false);
    }
  };

  const finishOnboarding = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("studios")
        .update({ onboarding_completed: true })
        .eq("id", studio?.id);
      
      if (error) throw error;
      toast.success("Onboarding completed!");
      router.push("/dashboard");
    } catch (error) {
      toast.error("Failed to complete onboarding");
    } finally {
      setIsLoading(false);
    }
  };

  if (!studio) return null;

  return (
    <div className="space-y-8">
      {/* Progress Bar */}
      <div className="space-y-4">
        <div className="flex justify-between items-end">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Step {step} of 5</p>
            <h1 className="text-2xl font-bold">
              {step === 1 && "Basic Studio Profile"}
              {step === 2 && "Business & GST Details"}
              {step === 3 && "Payment Integration"}
              {step === 4 && "Team Setup"}
              {step === 5 && "All Done!"}
            </h1>
          </div>
          <div className="text-sm font-medium text-accent">
            {Math.round((step / 5) * 100)}% Complete
          </div>
        </div>
        <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-accent transition-all duration-500 ease-out" 
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 min-h-[400px] flex flex-col">
        {step === 1 && (
          <div className="space-y-6 flex-1">
            <div className="flex flex-col sm:flex-row gap-8 items-start">
              <div className="space-y-2">
                <Label>Studio Logo</Label>
                <div 
                  className="w-32 h-32 rounded-xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center gap-2 hover:border-accent hover:bg-accent/5 transition-all cursor-pointer overflow-hidden relative group"
                  onClick={() => document.getElementById("logo-upload")?.click()}
                >
                  {logoPreview ? (
                    <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-2" />
                  ) : (
                    <>
                      <Upload className="w-6 h-6 text-muted-foreground" />
                      <span className="text-[10px] uppercase font-bold text-muted-foreground">Upload</span>
                    </>
                  )}
                  <input 
                    id="logo-upload" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setLogoFile(file);
                        setLogoPreview(URL.createObjectURL(file));
                      }
                    }}
                  />
                  {logoPreview && (
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-[10px] text-white font-bold uppercase tracking-wider">Change</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 w-full">
                <div className="space-y-2">
                  <Label htmlFor="name">Studio Name *</Label>
                  <Input id="name" {...step1Form.register("name")} />
                  {step1Form.formState.errors.name && (
                    <p className="text-xs text-brand-red">{step1Form.formState.errors.name.message as string}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input id="tagline" placeholder="Capturing moments that matter" {...step1Form.register("tagline")} />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="brand_color">Brand Primary Color</Label>
                <div className="flex gap-3 items-center">
                  <div 
                    className="w-10 h-10 rounded-lg border shadow-sm shrink-0" 
                    style={{ backgroundColor: step1Form.watch("brand_color") }} 
                  />
                  <Input id="brand_color" {...step1Form.register("brand_color")} />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input id="phone" placeholder="+91 9876543210" {...step1Form.register("phone")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input id="city" {...step1Form.register("city")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State *</Label>
                <select 
                  id="state" 
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                  {...step1Form.register("state")}
                >
                  <option value="">Select State</option>
                  {INDIAN_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 flex-1">
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 text-amber-800">
              <Building2 className="w-5 h-5 shrink-0 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold">Professional invoicing</p>
                <p className="opacity-80">Providing GST details allows you to generate compliant B2B invoices. You can leave them blank if you don&apos;t have them yet.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gstin">GSTIN (Optional)</Label>
                <Input id="gstin" placeholder="22AAAAA0000A1Z5" {...step2Form.register("gstin")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pan">PAN Card Number</Label>
                <Input id="pan" placeholder="ABCDE1234F" {...step2Form.register("pan")} />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="business_address">Full Business Address *</Label>
              <textarea 
                id="business_address" 
                rows={3}
                className="flex w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                {...step2Form.register("business_address")}
              />
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 flex-1">
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <img src="https://razorpay.com/favicon.ico" className="w-8 h-8" alt="Razorpay" />
              <div>
                <p className="text-sm font-semibold">Razorpay Integration</p>
                <p className="text-xs text-muted-foreground">Accept UPI, Credit Cards, and Netbanking</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="razorpay_key_id">Key ID</Label>
                <Input id="razorpay_key_id" placeholder="rzp_test_..." {...step3Form.register("razorpay_key_id")} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="razorpay_key_secret">Key Secret</Label>
                <Input id="razorpay_key_secret" type="password" {...step3Form.register("razorpay_key_secret")} />
              </div>
            </div>

            <div className="h-px bg-slate-100 my-4" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice_prefix">Invoice Prefix</Label>
                <Input id="invoice_prefix" {...step3Form.register("invoice_prefix")} />
              </div>
              <div className="space-y-2">
                <Label>Default Advance %</Label>
                <div className="flex items-center gap-4 pt-2">
                  <input 
                    type="range" min="10" max="100" step="5" 
                    className="flex-1 accent-accent"
                    onChange={(e) => step3Form.setValue("default_advance_pct", parseInt(e.target.value))}
                  />
                  <span className="font-bold text-accent min-w-[3ch]">{step3Form.watch("default_advance_pct")}%</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
              <UsersIcon className="w-10 h-10 text-blue-600" />
            </div>
            <div className="max-w-md space-y-4">
              <h2 className="text-xl font-bold">Collaborate with your team</h2>
              <p className="text-sm text-muted-foreground">
                You can invite photographers, videographers, and editors to your studio. 
                They will receive unique login links.
              </p>
              <div className="space-y-3 pt-4">
                <Input placeholder="photographer@example.com" />
                <Button variant="outline" className="w-full">Invite Member</Button>
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="space-y-8 flex-1 flex flex-col items-center justify-center text-center">
            <div className="bg-brand-teal/10 w-24 h-24 rounded-full flex items-center justify-center mb-4 animate-bounce">
              <PartyPopper className="w-12 h-12 text-brand-teal" />
            </div>
            <div className="max-w-md space-y-4">
              <h2 className="text-3xl font-bold tracking-tight">You&apos;re all set!</h2>
              <p className="text-lg text-muted-foreground">
                Welcome to StudioDesk. Your studio is ready for its first booking.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-8">
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Company</p>
                  <p className="font-bold truncate">{studio?.name}</p>
                </div>
                <div className="p-4 rounded-xl border border-slate-100 bg-slate-50 text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Payments</p>
                  <p className="font-bold truncate">{(step3Form.getValues() as Step3Values).razorpay_key_id ? "Connected" : "Manual Only"}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-auto pt-8 flex justify-between gap-4">
          {step > 1 && step < 5 ? (
            <Button variant="ghost" onClick={() => setStep(s => s - 1)} disabled={isLoading}>
              <ChevronLeft className="w-4 h-4 mr-2" /> Back
            </Button>
          ) : <div />}

          <div className="flex gap-3">
            {[3, 4].includes(step) && (
              <Button variant="ghost" onClick={() => setStep(s => s + 1)} disabled={isLoading}>
                Skip for now
              </Button>
            )}
            
            {step < 5 ? (
              <Button className="min-w-[140px]" onClick={handleNext} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Continue <ChevronRight className="w-4 h-4 ml-2" /></>}
              </Button>
            ) : (
              <Button className="min-w-[200px] h-12 text-lg" onClick={finishOnboarding} disabled={isLoading}>
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Access Dashboard"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
