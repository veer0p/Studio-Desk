"use client";

import { useState } from "react";
import { 
  ArrowLeft, 
  Save, 
  Settings2, 
  Eye, 
  Layout, 
  Palette,
  CheckCircle2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { InquiryFormPreview } from "@/components/leads/InquiryFormPreview";

const formConfigSchema = z.object({
  form_title: z.string().min(1),
  form_subtitle: z.string().optional(),
  button_text: z.string().min(1),
  show_event_type: z.boolean(),
  show_event_date: z.boolean(),
  show_venue: z.boolean(),
  show_guest_count: z.boolean(),
  show_budget: z.boolean(),
  show_message: z.boolean(),
  require_email: z.boolean(),
  require_phone: z.boolean(),
});

export default function InquiryFormPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("builder");
  
  // Mock data for studio (would come from useCurrentStudio)
  const studio = { slug: "pixel-perfection", name: "Pixel Perfection" };

  const form = useForm<z.infer<typeof formConfigSchema>>({
    resolver: zodResolver(formConfigSchema),
    defaultValues: {
      form_title: "Book Your Photography Session",
      button_text: "Send Inquiry",
      show_event_type: true,
      show_event_date: true,
      show_venue: true,
      show_guest_count: false,
      show_budget: true,
      show_message: true,
      require_email: true,
      require_phone: true,
    },
  });

  const onSubmit = async (values: z.infer<typeof formConfigSchema>) => {
    try {
      // API call to save config
      toast.success("Form configuration saved!");
    } catch (error) {
      toast.error("Failed to save configuration");
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Inquiry Form Builder</h1>
            <p className="text-sm text-muted-foreground">Customize how clients find you.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => setActiveTab(activeTab === "builder" ? "preview" : "builder")}>
            {activeTab === "builder" ? <Eye className="w-4 h-4 mr-2" /> : <Settings2 className="w-4 h-4 mr-2" />}
            {activeTab === "builder" ? "Preview Form" : "Back to Editor"}
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)}>
            <Save className="w-4 h-4 mr-2" /> Save Changes
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsContent value="builder" className="mt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Settings Column */}
            <div className="md:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-8 shadow-sm">
                
                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Layout className="w-4 h-4 text-primary" /> Content & Branding
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Form Title</Label>
                      <Input {...form.register("form_title")} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">Submit Button Text</Label>
                      <Input {...form.register("button_text")} />
                    </div>
                  </div>
                </section>

                <Separator />

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Settings2 className="w-4 h-4 text-primary" /> Field Visibility
                  </div>
                  <div className="space-y-3">
                    {[
                      { id: "show_event_type", label: "Event Type" },
                      { id: "show_event_date", label: "Event Date" },
                      { id: "show_venue", label: "Venue / Location" },
                      { id: "show_guest_count", label: "Guest Count" },
                      { id: "show_budget", label: "Estimated Budget" },
                      { id: "show_message", label: "Personal Message" },
                    ].map((field) => (
                      <div key={field.id} className="flex items-center justify-between py-1">
                        <Label htmlFor={field.id} className="text-sm font-medium cursor-pointer">{field.label}</Label>
                        <Checkbox 
                          id={field.id} 
                          checked={form.watch(field.id as any)} 
                          onCheckedChange={(checked) => form.setValue(field.id as any, !!checked)} 
                        />
                      </div>
                    ))}
                  </div>
                </section>

                <Separator />

                <section className="space-y-4">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-primary" /> Validation
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Require Email</Label>
                      <Checkbox checked={form.watch("require_email")} onCheckedChange={(c) => form.setValue("require_email", !!c)} />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Require Phone</Label>
                      <Checkbox checked={form.watch("require_phone")} onCheckedChange={(c) => form.setValue("require_phone", !!c)} />
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Live Real-timeish Preview (Smaller) */}
            <div className="md:col-span-2">
                 <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-8 flex flex-col items-center justify-center min-h-[600px] text-center">
                    <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden text-left">
                       <div className="p-8 border-b border-slate-100">
                          <h2 className="text-2xl font-bold text-slate-900">{form.watch("form_title")}</h2>
                          <p className="text-sm text-slate-500 mt-1">Please fill out the details below.</p>
                       </div>
                       <div className="p-8 space-y-4 opacity-50 pointer-events-none">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2"><div className="h-3 w-16 bg-slate-100 rounded" /><div className="h-9 bg-slate-50 rounded" /></div>
                            <div className="space-y-2"><div className="h-3 w-16 bg-slate-100 rounded" /><div className="h-9 bg-slate-50 rounded" /></div>
                          </div>
                          {form.watch("show_event_type") && <div className="space-y-2"><div className="h-3 w-24 bg-slate-100 rounded" /><div className="h-9 bg-slate-50 rounded" /></div>}
                          {form.watch("show_event_date") && <div className="space-y-2"><div className="h-3 w-24 bg-slate-100 rounded" /><div className="h-9 bg-slate-50 rounded" /></div>}
                          <div className="pt-4">
                            <Button className="w-full bg-[#1A3C5E]">{form.watch("button_text")}</Button>
                          </div>
                       </div>
                    </div>
                    <p className="mt-6 text-sm text-slate-400 font-medium italic">
                      This is a simplified wireframe. Switch to "Preview Form" for the final look.
                    </p>
                 </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="mt-0">
          <InquiryFormPreview studio={studio} config={form.getValues()} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
