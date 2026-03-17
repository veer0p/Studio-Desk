"use client";

import { useState } from "react";
import { 
  Monitor, 
  Smartphone, 
  Copy, 
  Code, 
  ExternalLink, 
  QrCode,
  Check,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import { generateEmbedCode, generateShareLink } from "@/lib/inquiry-form/embed";

interface InquiryFormPreviewProps {
  studio: any;
  config: any;
}

export function InquiryFormPreview({ studio, config }: InquiryFormPreviewProps) {
  const [copied, setCopied] = useState(false);
  const [device, setDevice] = useState<"desktop" | "mobile">("desktop");
  
  const embedCode = generateEmbedCode(studio.slug);
  const shareLink = generateShareLink(studio.slug);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left: Preview */}
      <div className="lg:col-span-2 space-y-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">Live Preview</h3>
            <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded font-bold">
              <RefreshCw className="w-2.5 h-2.5" /> AUTO-SYNC ON
            </span>
          </div>
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button 
               onClick={() => setDevice("desktop")}
               className={cn("p-1.5 rounded", device === "desktop" ? "bg-white shadow-sm" : "text-slate-400")}
             >
               <Monitor className="w-4 h-4" />
             </button>
             <button 
               onClick={() => setDevice("mobile")}
               className={cn("p-1.5 rounded", device === "mobile" ? "bg-white shadow-sm" : "text-slate-400")}
             >
               <Smartphone className="w-4 h-4" />
             </button>
          </div>
        </div>

        <div className={cn(
          "bg-white border-2 border-slate-200 rounded-2xl overflow-hidden shadow-inner transition-all mx-auto",
          device === "mobile" ? "w-[375px] h-[667px]" : "w-full h-[600px]"
        )}>
          {/* Iframe of the public form */}
          <iframe 
            src={`/inquiry/${studio.slug}?preview=true`}
            className="w-full h-full border-none"
            title="Form Preview"
          />
        </div>
      </div>

      {/* Right: Integration Options */}
      <div className="space-y-6">
        <Card className="border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-4">
            <CardTitle className="text-lg">Share & Integrate</CardTitle>
            <CardDescription>Use these to publish your form.</CardDescription>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Public Link</Label>
              <div className="flex gap-2">
                 <div className="flex-1 bg-slate-100 rounded-lg px-3 py-2 text-xs truncate font-medium text-slate-600">
                   {shareLink}
                 </div>
                 <Button size="icon" variant="outline" className="h-9 w-9" onClick={() => copyToClipboard(shareLink)}>
                   {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                 </Button>
              </div>
              <Button variant="outline" className="w-full text-xs h-9" asChild>
                <a href={shareLink} target="_blank" rel="noopener noreferrer">
                  View Public Form <ExternalLink className="w-3 h-3 ml-2" />
                </a>
              </Button>
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-[10px] font-bold uppercase text-slate-400">Embed on Website</Label>
              <div className="space-y-2">
                <div className="bg-slate-900 rounded-lg p-3 relative group">
                  <div className="text-[10px] text-slate-500 mb-1">HTML IFRAME</div>
                  <code className="text-xs text-sky-400 block truncate">
                    {embedCode}
                  </code>
                  <button 
                    onClick={() => copyToClipboard(embedCode)}
                    className="absolute top-2 right-2 p-1 text-slate-500 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <p className="text-[10px] text-slate-400 italic">
                  Best for Wix, WordPress, Webflow, or custom sites.
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
               <Label className="text-[10px] font-bold uppercase text-slate-400">QR Code</Label>
               <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center border border-slate-200 dashed">
                    <QrCode className="w-8 h-8 text-slate-300" />
                  </div>
                  <div className="flex-1 space-y-1">
                     <p className="text-xs font-medium">Download for Print</p>
                     <Button variant="link" size="sm" className="p-0 h-auto text-primary text-[10px] font-bold uppercase">
                       Download PNG
                     </Button>
                  </div>
               </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}

function Label({ children, className }: { children: React.ReactNode, className?: string }) {
  return <div className={cn("font-medium", className)}>{children}</div>;
}
