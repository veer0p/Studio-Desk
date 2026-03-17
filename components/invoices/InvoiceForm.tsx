"use client";

import { 
  Plus, 
  Trash2, 
  Settings2, 
  Calculator, 
  ChevronRight,
  Info
} from "lucide-react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { format } from "date-fns";
import { useState, useMemo } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { formatINR } from "@/lib/formatters";
import { GSTBreakdown } from "@/components/proposals/GSTBreakdown";

const invoiceSchema = z.object({
  type: z.enum(["advance", "balance", "full", "credit_note"]),
  due_date: z.string(),
  notes: z.string().optional(),
  items: z.array(z.object({
    id: z.string(),
    description: z.string().min(1, "Description required"),
    hsn_sac: z.string().optional(),
    quantity: z.number().min(1),
    rate: z.number().min(0),
    amount: z.number()
  })),
  gst_type: z.enum(["cgst_sgst", "igst", "exempt"]),
  is_exempt: z.boolean().default(false),
});

interface InvoiceFormProps {
  booking: any;
  existingInvoices: any[];
  invoiceType?: "advance" | "balance" | "full" | "credit_note";
  onSave: (data: any) => void;
}

export function InvoiceForm({ booking, existingInvoices, invoiceType = "full", onSave }: InvoiceFormProps) {
  const [isExempt, setIsExempt] = useState(false);

  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      type: invoiceType,
      due_date: format(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), "yyyy-MM-dd"),
      items: booking.package_snapshot?.items?.map((item: any) => ({
        id: item.id || Math.random().toString(36).substr(2, 9),
        description: item.name || item.description,
        hsn_sac: "998311", // Standard Photo Services HSN
        quantity: 1,
        rate: item.price || item.unit_price,
        amount: (item.price || item.unit_price) * 1
      })) || [{ id: "1", description: "", hsn_sac: "998311", quantity: 1, rate: 0, amount: 0 }],
      gst_type: booking.client_state === booking.studio_state ? "cgst_sgst" : "igst",
      is_exempt: false,
      notes: ""
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch("items");
  const subtotal = useMemo(() => {
    return watchedItems.reduce((sum, item) => sum + (item.rate * item.quantity), 0);
  }, [watchedItems]);

  const gstRate = isExempt ? 0 : 0.18;
  const gstTotal = subtotal * gstRate;
  const grandTotal = subtotal + gstTotal;

  return (
    <form onSubmit={handleSubmit(onSave)} className="space-y-8 pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left: Form Fields */}
        <div className="lg:col-span-2 space-y-8">
           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                 <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Invoice Type</Label>
                    <Select defaultValue={invoiceType} onValueChange={(v: any) => setValue("type", v)}>
                       <SelectTrigger className="h-12 border-slate-200">
                          <SelectValue placeholder="Select type" />
                       </SelectTrigger>
                       <SelectContent>
                          <SelectItem value="advance">Advance Invoice</SelectItem>
                          <SelectItem value="balance">Balance Invoice</SelectItem>
                          <SelectItem value="full">Full Invoice</SelectItem>
                          <SelectItem value="credit_note">Credit Note</SelectItem>
                       </SelectContent>
                    </Select>
                 </div>
                 <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-slate-400">Due Date</Label>
                    <Input type="date" {...register("due_date")} className="h-12 border-slate-200" />
                 </div>
              </div>

              <div className="space-y-6">
                 <div className="flex justify-between items-center">
                    <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Line Items</h3>
                    <Button type="button" variant="outline" size="sm" onClick={() => append({ id: Math.random().toString(), description: "", hsn_sac: "998311", quantity: 1, rate: 0, amount: 0 })} className="h-9 rounded-xl font-bold border-slate-200">
                       <Plus className="w-3.5 h-3.5 mr-2" /> Add Item
                    </Button>
                 </div>

                 <div className="space-y-4">
                    {fields.map((field, index) => (
                      <div key={field.id} className="grid grid-cols-12 gap-4 items-start pb-4 border-b border-slate-50 last:border-0 group">
                         <div className="col-span-6 space-y-2">
                            <Input 
                              placeholder="Description" 
                              {...register(`items.${index}.description` as const)} 
                              className="h-10 border-slate-200 text-sm font-bold"
                            />
                            <Input 
                              placeholder="HSN/SAC" 
                              {...register(`items.${index}.hsn_sac` as const)} 
                              className="h-8 border-none bg-slate-50 text-[10px] font-mono uppercase tracking-widest w-24 px-2"
                            />
                         </div>
                         <div className="col-span-2">
                            <Input 
                              type="number" 
                              placeholder="Qty" 
                              {...register(`items.${index}.quantity` as const, { valueAsNumber: true })} 
                              className="h-10 border-slate-200 text-center text-sm"
                            />
                         </div>
                         <div className="col-span-3 pb-2">
                            <div className="relative">
                               <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs font-bold">₹</span>
                               <Input 
                                 type="number" 
                                 placeholder="Rate" 
                                 {...register(`items.${index}.rate` as const, { valueAsNumber: true })} 
                                 className="h-10 border-slate-200 pl-7 text-sm font-bold"
                               />
                            </div>
                         </div>
                         <div className="col-span-1 pt-2">
                            <Button variant="ghost" size="icon" onClick={() => remove(index)} className="h-8 w-8 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg">
                               <Trash2 className="w-4 h-4" />
                            </Button>
                         </div>
                      </div>
                    ))}
                 </div>
              </div>
           </Card>

           <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl p-8 space-y-4">
              <div className="flex justify-between items-center mb-4">
                 <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Settings & Notes</h3>
                 <div className="flex items-center gap-3">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">GST Exempt</Label>
                    <Switch checked={isExempt} onCheckedChange={(v) => { setIsExempt(v); setValue("is_exempt", v); }} />
                 </div>
              </div>
              <Textarea 
                placeholder="Internal notes or terms for this invoice..." 
                className="bg-slate-50 border-none rounded-2xl p-4 min-h-[120px] focus:bg-white transition-all"
                {...register("notes")}
              />
           </Card>
        </div>

        {/* Right: Summary Panel */}
        <div className="lg:col-span-1 space-y-6 lg:sticky lg:top-8">
           <Card className="border-none shadow-2xl shadow-primary/5 rounded-3xl p-8 space-y-8 bg-white border-2 border-slate-100">
              <div className="space-y-4">
                 <h3 className="text-lg font-bold text-slate-900">Summary</h3>
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm font-medium">
                       <span className="text-slate-500">Subtotal</span>
                       <span className="text-slate-900">{formatINR(subtotal)}</span>
                    </div>
                    
                    <GSTBreakdown 
                      subtotal={subtotal} 
                      gstType={isExempt ? "exempt" : (booking.client_state === booking.studio_state ? "cgst_sgst" : "igst")} 
                    />

                    <Separator className="bg-slate-100" />
                    
                    <div className="flex justify-between items-center pt-2">
                       <span className="text-xl font-black text-slate-900 tracking-tight">Total Invoice</span>
                       <span className="text-2xl font-black text-primary tracking-tighter">{formatINR(grandTotal)}</span>
                    </div>
                 </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-6 border-l-4 border-primary space-y-2">
                 <h4 className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1.5">
                    <Info className="w-3 h-3" /> Remaining Balance
                 </h4>
                 <p className="text-xs font-bold text-slate-900">
                    After this invoice, <span className="text-rose-600 font-black">{formatINR(booking.total_amount - (booking.amount_paid + grandTotal))}</span> remains pending for this booking.
                 </p>
              </div>

              <div className="space-y-3">
                 <Button 
                   type="submit" 
                   className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-bold shadow-xl shadow-slate-200 transition-all active:scale-[0.98]"
                   onClick={() => setValue("type", invoiceType)}
                 >
                    Create & Send Invoice <ChevronRight className="w-4 h-4 ml-2" />
                 </Button>
                 <Button type="button" variant="ghost" className="w-full h-12 rounded-2xl font-bold text-slate-400 hover:text-slate-900">
                    Save as Draft
                 </Button>
              </div>
           </Card>
        </div>

      </div>
    </form>
  );
}
