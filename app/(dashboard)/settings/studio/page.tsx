"use client";

import { useState, useMemo } from "react";
import { Upload, Check, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import debounce from "lodash/debounce";

export default function StudioSettingsPage() {
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [formData, setFormData] = useState({
    name: "Pixel Perfect Studio",
    tagline: "Capturing your moments across time",
    website: "https://pixelperfect.in",
    phone: "+91 98765 43210",
    email: "contact@pixelperfect.in",
    address: "102, Business Bay, MG Road, Mumbai, Maharashtra 400001",
    brand_color: "#1a3c5e",
    logo_url: null as string | null
  });

  const debouncedSave = useMemo(
    () => debounce(async (values) => {
      setSaveStatus('saving');
      try {
        await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } catch {
        setSaveStatus('error');
        toast.error("Failed to sync branding");
      }
    }, 1500),
    []
  );

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    debouncedSave({ ...formData, [field]: value });
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Studio Profile</h1>
          <p className="text-sm font-medium text-slate-400 italic">Changes are saved automatically</p>
        </div>
        <div className="flex items-center gap-2">
           {saveStatus === 'saving' && <span className="text-[10px] font-black uppercase text-blue-500 animate-pulse font-mono tracking-widest">Syncing...</span>}
           {saveStatus === 'saved' && <span className="text-[10px] font-black uppercase text-emerald-500 flex items-center gap-1 font-mono tracking-widest"><Check className="w-3 h-3" /> All Saved</span>}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
           <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-slate-50 rounded-[2.5rem] border-4 border-white shadow-xl flex items-center justify-center overflow-hidden">
                 <span className="text-3xl font-black text-slate-200">P</span>
              </div>
              <div className="space-y-2">
                 <h4 className="text-sm font-black text-slate-900 tracking-tight">Studio Logo</h4>
                 <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest border-slate-200">Upload</Button>
                    <Button size="sm" variant="ghost" className="h-8 rounded-lg text-[10px] font-black uppercase tracking-widest text-rose-500">Remove</Button>
                 </div>
              </div>
           </div>

           <div className="space-y-6 pt-4 border-t border-slate-50">
              <div className="grid gap-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Studio Name</Label>
                 <Input value={formData.name} onChange={(e) => handleChange('name', e.target.value)} className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold" />
              </div>
              <div className="grid gap-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Brand Accent</Label>
                 <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 rounded-2xl border-4 border-white shadow-md" style={{ backgroundColor: formData.brand_color }} />
                    <Input value={formData.brand_color.toUpperCase()} onChange={(e) => handleChange('brand_color', e.target.value)} className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-mono text-xs text-center flex-1" />
                 </div>
              </div>
           </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
           <div className="grid gap-6">
              <div className="grid gap-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</Label>
                 <Input value={formData.email} onChange={(e) => handleChange('email', e.target.value)} className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold" />
              </div>
              <div className="grid gap-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Contact Number</Label>
                 <Input value={formData.phone} onChange={(e) => handleChange('phone', e.target.value)} className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold" />
              </div>
              <div className="grid gap-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Address</Label>
                 <Textarea value={formData.address} onChange={(e) => handleChange('address', e.target.value)} className="rounded-2xl bg-slate-50/50 border-slate-100 font-bold min-h-[100px]" />
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
