"use client";

import { Check, Info, ShieldCheck, Landmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

export default function BusinessSettingsPage() {
  const [formData, setFormData] = useState({
    business_name: "Pixel Perfect Studio Pvt Ltd",
    gstin: "27AAACP0000A1Z5",
    pan: "AAACP0000A",
    state: "Maharashtra",
    currency: "INR",
    tax_rate: "18"
  });

  const handleSave = () => {
    toast.success("Business details updated");
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Business & Tax</h1>
          <p className="text-sm font-medium text-slate-400">Configure your legal and financial presence</p>
        </div>
        <Button onClick={handleSave} className="h-11 px-6 rounded-xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-slate-200">
           <Check className="w-4 h-4" /> Save Configuration
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center text-blue-500">
                 <Landmark className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Tax Information (GST)</h3>
           </div>

           <div className="grid gap-6">
              <div className="grid gap-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Legal Business Name</Label>
                 <Input value={formData.business_name} onChange={(e) => setFormData({...formData, business_name: e.target.value})} className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                 <div className="grid gap-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">GSTIN</Label>
                    <Input value={formData.gstin} onChange={(e) => setFormData({...formData, gstin: e.target.value})} className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-mono font-bold" />
                 </div>
                 <div className="grid gap-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">PAN</Label>
                    <Input value={formData.pan} onChange={(e) => setFormData({...formData, pan: e.target.value})} className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-mono font-bold" />
                 </div>
              </div>
              <div className="grid gap-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Registered State</Label>
                 <Select value={formData.state} onValueChange={(val) => setFormData({...formData, state: val})}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="Maharashtra">Maharashtra</SelectItem>
                       <SelectItem value="Karnataka">Karnataka</SelectItem>
                       <SelectItem value="Delhi">Delhi</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
           </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 space-y-8 shadow-sm">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-500">
                 <ShieldCheck className="w-4 h-4" />
              </div>
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Financial Defaults</h3>
           </div>

           <div className="grid gap-6">
              <div className="grid gap-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Base Currency</Label>
                 <Select value={formData.currency}>
                    <SelectTrigger className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold">
                       <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="INR">Indian Rupee (₹)</SelectItem>
                       <SelectItem value="USD">US Dollar ($)</SelectItem>
                    </SelectContent>
                 </Select>
              </div>
              <div className="grid gap-3">
                 <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Default GST Rate (%)</Label>
                 <Input type="number" value={formData.tax_rate} onChange={(e) => setFormData({...formData, tax_rate: e.target.value})} className="h-12 rounded-2xl bg-slate-50/50 border-slate-100 font-bold" />
              </div>
           </div>

           <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100 flex gap-4">
              <Info className="w-6 h-6 text-amber-500 shrink-0" />
              <p className="text-[10px] font-bold text-amber-900 leading-relaxed italic">
                 Note: Tax details are printed on all invoices. Ensure they match your registered legal records to remain compliant with Indian GST laws.
              </p>
           </div>
        </div>
      </div>
    </div>
  );
}
