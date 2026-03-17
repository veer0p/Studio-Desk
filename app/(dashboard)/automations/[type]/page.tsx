"use client";

import { useState } from "react";
import { 
  ChevronLeft, 
  Save, 
  MessageSquare, 
  Mail, 
  Zap, 
  Clock, 
  Eye, 
  Loader2,
  FileText,
  AlertTriangle,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { toast } from "sonner";
import { AutomationMessagePreview } from "@/components/automations/AutomationMessagePreview";

export default function ConfigureAutomationPage({ params }: { params: { type: string } }) {
  const [isSaving, setIsSaving] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  const [timing, setTiming] = useState("instant");
  const [delayValue, setDelayValue] = useState("0");
  const [emailTemplate, setEmailTemplate] = useState("temp-1");
  const [whatsappTemplate, setWhatsappTemplate] = useState("temp-w1");

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(r => setTimeout(r, 1500));
    setIsSaving(false);
    toast.success("Automation settings saved");
  };

  const automationTitle = params.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-white shadow-sm border border-slate-100" asChild>
              <Link href="/automations">
                 <ChevronLeft className="w-5 h-5 text-slate-400" />
              </Link>
           </Button>
           <div>
              <div className="flex items-center gap-2 mb-0.5">
                 <h1 className="text-3xl font-bold tracking-tight text-slate-900">{automationTitle}</h1>
                 <Badge className="bg-emerald-50 text-emerald-500 border-none px-2 h-5 text-[9px] font-black uppercase tracking-widest">Active</Badge>
              </div>
              <p className="text-sm text-muted-foreground font-medium flex items-center gap-2">
                 <Zap className="w-3.5 h-3.5 text-primary" /> Triggered by Lead Inquiry Form Submission
              </p>
           </div>
        </div>

        <Button className="h-12 px-8 rounded-2xl font-black bg-slate-900 shadow-xl shadow-slate-200 transition-all active:scale-95" onClick={handleSave} disabled={isSaving}>
           {isSaving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />} Save Settings
        </Button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">
         <div className="xl:col-span-7 space-y-10">
            {/* Communication Timing */}
            <section className="space-y-6">
               <div className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-slate-400" />
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Trigger Timing</h2>
               </div>
               <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] p-8 space-y-8">
                  <div className="flex flex-col sm:flex-row gap-6">
                     <div className="flex-1 space-y-3">
                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">When should it fire?</Label>
                        <Select value={timing} onValueChange={setTiming}>
                           <SelectTrigger className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold">
                              <SelectValue placeholder="Select timing" />
                           </SelectTrigger>
                           <SelectContent className="rounded-xl font-bold">
                              <SelectItem value="instant">Instantly</SelectItem>
                              <SelectItem value="delayed">With Delay</SelectItem>
                              <SelectItem value="scheduled">Scheduled Time</SelectItem>
                           </SelectContent>
                        </Select>
                     </div>
                     {timing === 'delayed' && (
                       <div className="w-full sm:w-48 space-y-3 animate-in fade-in slide-in-from-left-4 duration-300">
                          <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Delay (Minutes)</Label>
                          <Input 
                            type="number" 
                            value={delayValue} 
                            onChange={(e) => setDelayValue(e.target.value)}
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/50 font-bold" 
                          />
                       </div>
                     )}
                  </div>
                  <div className="p-4 bg-primary/5 rounded-2xl flex gap-3 text-[10px] font-bold text-primary italic border border-primary/10">
                     <Info className="w-4 h-4 shrink-0" />
                     Instant automations fire within 60 seconds of the event being recorded in StudioDesk.
                  </div>
               </Card>
            </section>

            {/* Communication Channels */}
            <section className="space-y-8">
               <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-slate-400" />
                  <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Channels & Content</h2>
               </div>
               
               <div className="space-y-6">
                  {/* WhatsApp Channel */}
                  <Card className={cn(
                    "border-none shadow-2xl rounded-[2.5rem] transition-all duration-500 overflow-hidden",
                    whatsappEnabled ? "bg-white shadow-slate-200/50" : "bg-slate-50 shadow-none opacity-60"
                  )}>
                     <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                                whatsappEnabled ? "bg-emerald-500 text-white" : "bg-slate-200 text-slate-400"
                              )}>
                                 <MessageSquare className="w-6 h-6" />
                              </div>
                              <div>
                                 <h3 className="text-lg font-black text-slate-900 leading-tight">WhatsApp Business</h3>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enabled via Meta API</p>
                              </div>
                           </div>
                           <Switch checked={whatsappEnabled} onCheckedChange={setWhatsappEnabled} className="data-[state=checked]:bg-emerald-500" />
                        </div>

                        {whatsappEnabled && (
                          <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Template</Label>
                                <Select value={whatsappTemplate} onValueChange={setWhatsappTemplate}>
                                   <SelectTrigger className="h-14 rounded-2xl border-slate-100 font-bold">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-xl font-bold">
                                      <SelectItem value="temp-w1">Inquiry_Auto_Reply_V1</SelectItem>
                                      <SelectItem value="temp-w2">Inquiry_Auto_Reply_V2 (Formal)</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="flex gap-2">
                                <Button variant="ghost" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5" asChild>
                                   <Link href="/automations/templates/whatsapp/new">Register New Template</Link>
                                </Button>
                             </div>
                          </div>
                        )}
                     </div>
                  </Card>

                  {/* Email Channel */}
                  <Card className={cn(
                    "border-none shadow-2xl rounded-[2.5rem] transition-all duration-500 overflow-hidden",
                    emailEnabled ? "bg-white shadow-slate-200/50" : "bg-slate-50 shadow-none opacity-60"
                  )}>
                     <div className="p-8 space-y-6">
                        <div className="flex justify-between items-center">
                           <div className="flex items-center gap-4">
                              <div className={cn(
                                "w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner",
                                emailEnabled ? "bg-blue-500 text-white" : "bg-slate-200 text-slate-400"
                              )}>
                                 <Mail className="w-6 h-6" />
                              </div>
                              <div>
                                 <h3 className="text-lg font-black text-slate-900 leading-tight">Professional Email</h3>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sent from hello@studiodesk.in</p>
                              </div>
                           </div>
                           <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} className="data-[state=checked]:bg-blue-500" />
                        </div>

                        {emailEnabled && (
                          <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
                             <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Select Template</Label>
                                <Select value={emailTemplate} onValueChange={setEmailTemplate}>
                                   <SelectTrigger className="h-14 rounded-2xl border-slate-100 font-bold">
                                      <SelectValue />
                                   </SelectTrigger>
                                   <SelectContent className="rounded-xl font-bold">
                                      <SelectItem value="temp-1">Lead Welcome Email (Modern)</SelectItem>
                                      <SelectItem value="temp-2">Lead Welcome Email (Minimal)</SelectItem>
                                   </SelectContent>
                                </Select>
                             </div>
                             <div className="flex gap-2">
                                <Button variant="ghost" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5" asChild>
                                   <Link href={`/automations/templates/email/${emailTemplate}`}>Edit in Code Editor</Link>
                                </Button>
                             </div>
                          </div>
                        )}
                     </div>
                  </Card>
               </div>
            </section>
         </div>

         {/* Live Preview */}
         <aside className="xl:col-span-5 space-y-6 sticky top-8">
            <div className="flex items-center gap-2">
               <Eye className="w-5 h-5 text-slate-400" />
               <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Live Preview</h2>
            </div>
            
            <Tabs defaultValue="whatsapp" className="w-full">
               <TabsList className="bg-slate-100 p-1 rounded-2xl h-14 w-full grid grid-cols-2 mb-6">
                  <TabsTrigger value="whatsapp" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">WhatsApp</TabsTrigger>
                  <TabsTrigger value="email" className="rounded-xl font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Email</TabsTrigger>
               </TabsList>

               <TabsContent value="whatsapp" className="animate-in fade-in zoom-in-95 duration-500 outline-none">
                  <AutomationMessagePreview 
                    type="whatsapp" 
                    templateId={whatsappTemplate} 
                    enabled={whatsappEnabled}
                  />
               </TabsContent>
               <TabsContent value="email" className="animate-in fade-in zoom-in-95 duration-500 outline-none">
                  <AutomationMessagePreview 
                    type="email" 
                    templateId={emailTemplate} 
                    enabled={emailEnabled}
                  />
               </TabsContent>
            </Tabs>

            <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100 space-y-4">
               <div className="flex items-center gap-3 text-amber-600">
                  <AlertTriangle className="w-5 h-5" />
                  <h4 className="text-sm font-black uppercase tracking-widest">Compliance Check</h4>
               </div>
               <p className="text-[11px] font-medium text-amber-800/70 leading-relaxed italic">
                  Preview uses sample data. Actual messages will include client specifics like Name, Booking Date, and Amount. Ensure all variables like &#123;&#123;1&#125;&#125; are correctly mapped in your template.
               </p>
            </div>
         </aside>
      </div>
    </div>
  );
}
