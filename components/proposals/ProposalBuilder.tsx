"use client";

import { useState, useMemo, useEffect } from "react";
import { 
  Plus, 
  Package as PackageIcon, 
  Trash2, 
  Save, 
  Eye, 
  Send,
  ArrowLeft,
  Calendar,
  Settings,
  ShieldCheck,
  ChevronDown
} from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

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
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { ProposalLineItemRow, LineItem } from "./ProposalLineItemRow";
import { GSTBreakdown, GstType } from "./GSTBreakdown";
import { ProposalPDFPreview } from "./ProposalPDFPreview";

interface ProposalBuilderProps {
  booking: any;
  packages: any[];
  addons: any[];
  onProposalCreated?: (proposal: any) => void;
}

export function ProposalBuilder({ booking, packages, addons, onProposalCreated }: ProposalBuilderProps) {
  const router = useRouter();
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [gstType, setGstType] = useState<GstType>("intra");
  const [validUntil, setValidUntil] = useState("");
  const [notes, setNotes] = useState("");
  const [advancePct, setAdvancePct] = useState(30);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize with 7 days validity
  useEffect(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7);
    setValidUntil(date.toISOString().split("T")[0]);
  }, []);

  const subtotal = useMemo(() => {
    return lineItems.reduce((acc, item) => acc + (item.qty * item.unit_price), 0);
  }, [lineItems]);

  const addLineItem = () => {
    const newItem: LineItem = {
      id: uuidv4(),
      name: "",
      description: "",
      hsn: "998389",
      qty: 1,
      unit_price: 0,
    };
    setLineItems([...lineItems, newItem]);
  };

  const updateLineItem = (updatedItem: LineItem) => {
    setLineItems(lineItems.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const removeLineItem = (id: string) => {
    setLineItems(lineItems.filter(item => item.id !== id));
  };

  const applyPackage = (pkg: any) => {
    const pkgItems: LineItem[] = [
      {
        id: uuidv4(),
        name: pkg.name,
        description: pkg.description || "",
        hsn: "998389",
        qty: 1,
        unit_price: pkg.price || 0,
      }
    ];
    setLineItems(pkgItems);
    toast.success(`Package "${pkg.name}" applied`);
  };

  const addAddon = (addon: any) => {
    const newItem: LineItem = {
      id: uuidv4(),
      name: addon.name,
      description: addon.description || "",
      hsn: "998389",
      qty: 1,
      unit_price: addon.price || 0,
    };
    setLineItems([...lineItems, newItem]);
    toast.success(`Addon "${addon.name}" added`);
  };

  const handleSave = async (status: "draft" | "sent") => {
    if (lineItems.length === 0) {
      toast.error("Please add at least one line item");
      return;
    }

    setIsSaving(true);
    try {
      // API call placeholder
      // const res = await fetch(`/api/bookings/${booking.id}/proposals`, { ... })
      
      toast.success(status === "sent" ? "Proposal sent to client!" : "Draft saved successfully");
      if (status === "sent") router.push(`/bookings/${booking.id}/proposals`);
    } catch (error) {
      toast.error("Failed to save proposal");
    } finally {
      setIsSaving(false);
    }
  };

  const proposalData = {
    line_items: lineItems,
    gst_type: gstType,
    notes,
    advance_pct: advancePct,
    valid_until: validUntil,
    total_amount: subtotal,
  };

  // Mock studio data (would come from context)
  const studio = { name: "Pixel Perfection", state: "Maharashtra", tagline: "Capturing your best moments" };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Left Column: Form (60%) */}
      <div className="lg:col-span-7 space-y-8 pb-20">
        
        {/* Section A: Package Selection */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">1. Select Package</h3>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5">Optional</Badge>
           </div>
           
           <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
              {packages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className="w-64 shrink-0 cursor-pointer border-slate-200 hover:border-primary hover:shadow-md transition-all group"
                  onClick={() => applyPackage(pkg)}
                >
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between items-start">
                       <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 group-hover:text-primary transition-colors">
                          <PackageIcon className="w-5 h-5" />
                       </div>
                       <Badge variant="secondary" className="text-[10px]">{pkg.event_type || "Generic"}</Badge>
                    </div>
                    <div>
                       <div className="font-bold text-slate-900 truncate">{pkg.name}</div>
                       <div className="text-xs text-slate-500 mt-1">Starting from</div>
                       <div className="text-lg font-black text-slate-900">₹{(pkg.price / 1000).toFixed(0)}k</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <div 
                className="w-64 shrink-0 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center text-slate-400 cursor-pointer hover:bg-slate-50 transition-all"
                onClick={addLineItem}
              >
                 <Plus className="w-6 h-6 mb-2" />
                 <span className="text-sm font-medium">Build from scratch</span>
              </div>
           </div>
        </div>

        {/* Section B: Line Items */}
        <div className="space-y-4">
           <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">2. Proposal Items</h3>
              <div className="flex gap-2">
                 <Select onValueChange={(v) => addAddon(addons.find(a => a.id === v))}>
                   <SelectTrigger className="h-8 w-32 text-xs border-dashed">
                      <Plus className="w-3 h-3 mr-1" /> Add Addon
                   </SelectTrigger>
                   <SelectContent>
                      {addons.map(a => (
                        <SelectItem key={a.id} value={a.id}>{a.name} (₹{a.price})</SelectItem>
                      ))}
                   </SelectContent>
                 </Select>
                 <Button variant="outline" size="sm" className="h-8 text-xs" onClick={addLineItem}>
                    <Plus className="w-3 h-3 mr-1" /> New Item
                 </Button>
              </div>
           </div>

           <div className="space-y-4">
              {lineItems.map((item, index) => (
                <ProposalLineItemRow 
                  key={item.id} 
                  item={item} 
                  index={index}
                  onChange={updateLineItem}
                  onRemove={() => removeLineItem(item.id)}
                />
              ))}
              
              {lineItems.length === 0 && (
                <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/30 text-slate-400">
                   <PackageIcon className="w-8 h-8 mb-3 opacity-20" />
                   <p className="text-sm">Start by selecting a package or adding an item</p>
                </div>
              )}
           </div>

           {/* Totals Section */}
           <div className="flex justify-end pt-8">
              <div className="w-full md:w-96 space-y-6">
                 <div className="flex items-center justify-between px-1">
                    <Label className="text-xs font-bold uppercase text-slate-400">GST Configuration</Label>
                    <Select value={gstType} onValueChange={(v: any) => setGstType(v)}>
                       <SelectTrigger className="h-7 w-28 text-[10px] font-bold uppercase">
                          <SelectValue />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="intra">Intra-state (CGST+SGST)</SelectItem>
                          <SelectItem value="inter">Inter-state (IGST)</SelectItem>
                          <SelectItem value="exempt">No GST / Exempt</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 
                 <GSTBreakdown 
                   subtotal={subtotal} 
                   gstType={gstType} 
                   studioState={studio.state} 
                   clientState={booking.client?.state || "Maharashtra"} 
                 />
              </div>
           </div>
        </div>

        {/* Section C: Settings */}
        <Separator />
        <div className="space-y-6 pt-2">
           <h3 className="text-lg font-bold text-slate-900">3. Proposal Settings</h3>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="flex items-center gap-2">
                       <Calendar className="w-4 h-4 text-slate-400" /> Valid Until
                    </Label>
                    <Input 
                      type="date" 
                      value={validUntil} 
                      onChange={(e) => setValidUntil(e.target.value)}
                      className="bg-slate-50 border-transparent focus:bg-white focus:border-slate-200" 
                    />
                 </div>

                 <div className="space-y-3 pt-2">
                    <div className="flex justify-between items-center px-1">
                       <Label className="flex items-center gap-2 font-bold text-xs uppercase text-slate-400">
                          <ShieldCheck className="w-4 h-4" /> Advance Payment
                       </Label>
                       <span className="text-sm font-black text-primary">{advancePct}%</span>
                    </div>
                    <Slider 
                      value={[advancePct]} 
                      onValueChange={([v]) => setAdvancePct(v)} 
                      max={100} 
                      step={5}
                      className="py-4"
                    />
                    <div className="flex justify-between p-3 bg-slate-900 rounded-xl text-white">
                       <div className="text-center">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Advance</div>
                          <div className="text-sm font-bold">₹{(subtotal * (advancePct/100)).toLocaleString()}</div>
                       </div>
                       <div className="w-px bg-slate-800 h-8 mt-1" />
                       <div className="text-center">
                          <div className="text-[10px] text-slate-400 font-bold uppercase">Balance</div>
                          <div className="text-sm font-bold">₹{(subtotal * (1 - advancePct/100)).toLocaleString()}</div>
                       </div>
                    </div>
                 </div>
              </div>

              <div className="space-y-2">
                 <Label className="flex items-center gap-2">
                    <Settings className="w-4 h-4 text-slate-400" /> Notes to Client
                 </Label>
                 <Textarea 
                   placeholder="Add special terms, inclusions, or a personalized message..."
                   className="min-h-[180px] bg-slate-50 border-transparent focus:bg-white focus:border-slate-200 resize-none"
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                 />
                 <p className="text-[10px] text-slate-400 italic">This will be visible to the client on the proposal page and PDF.</p>
              </div>
           </div>
        </div>

      </div>

      {/* Right Column: Mini Preview Sticky (5%) or floating? No, let's make it a sidebar on LG */}
      <div className="lg:col-span-5 sticky top-8 space-y-4 hidden lg:block">
         <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Instant Preview</h3>
            <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-none font-bold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" /> Live Sync
            </Badge>
         </div>
         
         <div className="bg-white border-2 border-slate-100 rounded-3xl shadow-xl p-8 h-[600px] overflow-hidden relative group">
            <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors pointer-events-none" />
            
            <div className="scale-[0.5] origin-top-left w-[200%] h-[200%] pointer-events-none select-none">
                {/* Simplified version of the PDF preview for real-time visualization */}
                <div className="p-8">
                  <div className="flex justify-between mb-12">
                    <div className="w-24 h-24 bg-slate-900 rounded-2xl" />
                    <div className="text-right"><h1 className="text-6xl font-black text-slate-200 uppercase">PROPOSAL</h1></div>
                  </div>
                  <div className="space-y-8">
                    <div className="h-4 w-64 bg-slate-100 rounded" />
                    <div className="h-4 w-48 bg-slate-100 rounded" />
                    <div className="space-y-4 pt-8">
                       {lineItems.map((_, i) => (
                         <div key={i} className="flex justify-between">
                            <div className="h-3 w-48 bg-slate-50 rounded" />
                            <div className="h-3 w-16 bg-slate-50 rounded" />
                         </div>
                       ))}
                    </div>
                  </div>
                </div>
            </div>

            <div className="absolute bottom-6 left-12 right-12">
               <Button 
                 variant="secondary" 
                 className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-xl border-none h-12"
                 onClick={() => setIsPreviewOpen(true)}
               >
                 <Eye className="w-4 h-4 mr-2" /> Full Preview
               </Button>
            </div>
         </div>

         <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10 flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
               <Send className="w-4 h-4" />
            </div>
            <div>
               <div className="text-xs font-bold text-primary">Ready to send?</div>
               <p className="text-[10px] text-slate-500">Clients can accept and sign digitally.</p>
            </div>
         </div>
      </div>

      {/* Mobile Floating Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-100 flex gap-3 lg:hidden z-50 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
          <Button variant="outline" className="flex-1" onClick={() => setIsPreviewOpen(true)}>
             <Eye className="w-4 h-4 mr-2" /> Preview
          </Button>
          <Button className="flex-1" onClick={() => handleSave("sent")}>
             <Send className="w-4 h-4 mr-2" /> Send to Client
          </Button>
      </div>

      {/* Global Actions (Desktop) */}
      <div className="fixed bottom-8 right-8 hidden lg:flex items-center gap-4 z-50">
          <Button 
            variant="outline" 
            className="bg-white/80 backdrop-blur shadow-lg border-slate-200 h-12 px-6"
            onClick={() => handleSave("draft")}
            disabled={isSaving}
          >
            {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Draft</>}
          </Button>
          <Button 
            className="bg-primary shadow-xl shadow-primary/20 h-12 px-8"
            onClick={() => handleSave("sent")}
            disabled={isSaving}
          >
            {isSaving ? "Sending..." : <><Send className="w-4 h-4 mr-2" /> Send proposal to client</>}
          </Button>
      </div>

      <ProposalPDFPreview 
        open={isPreviewOpen} 
        onOpenChange={setIsPreviewOpen} 
        proposalData={proposalData} 
        studio={studio} 
        client={booking.client} 
      />
    </div>
  );
}
