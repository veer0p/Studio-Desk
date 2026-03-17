"use client";

import { useState, useRef, useEffect } from "react";
import SignaturePadInstance from "signature_pad";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Eraser, Type, PenTool, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  onSignatureCapture: (dataUrl: string) => void;
  signerName: string;
}

export function SignaturePad({ onSignatureCapture, signerName }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const padRef = useRef<SignaturePadInstance | null>(null);
  const [mode, setMode] = useState<"draw" | "type">("draw");
  const [typeSignature, setTypeSignature] = useState(signerName);

  useEffect(() => {
    if (mode === "draw" && canvasRef.current) {
      const canvas = canvasRef.current;
      const pad = new SignaturePadInstance(canvas, {
        backgroundColor: "rgba(0,0,0,0)",
        penColor: "#000000",
        minWidth: 2,
        maxWidth: 4.5,
        velocityFilterWeight: 0.7,
      });

      const resizeCanvas = () => {
        const ratio = Math.max(window.devicePixelRatio || 1, 1);
        canvas.width = canvas.offsetWidth * ratio;
        canvas.height = canvas.offsetHeight * ratio;
        canvas.getContext("2d")?.scale(ratio, ratio);
        pad.clear(); // Clear to reset state after resize
      };

      window.addEventListener("resize", resizeCanvas);
      resizeCanvas();
      
      padRef.current = pad;

      const handleCapture = () => {
        if (!pad.isEmpty()) {
          onSignatureCapture(pad.toDataURL());
        }
      };

      pad.addEventListener("endStroke", handleCapture);
      return () => {
        window.removeEventListener("resize", resizeCanvas);
        pad.off();
        padRef.current = null;
      };
    }
  }, [mode, onSignatureCapture]);


  useEffect(() => {
    if (mode === "type") {
      // In a real app, we'd render this text to a hidden canvas and export DataURL
      // For now, let's just trigger capture with the name
      onSignatureCapture(`type:${typeSignature}`);
    }
  }, [mode, typeSignature, onSignatureCapture]);

  const clear = () => {
    if (padRef.current) {
      padRef.current.clear();
      onSignatureCapture("");
    }
  };

  return (
    <Card className="border-none shadow-none bg-transparent">
      <Tabs value={mode} onValueChange={(v: any) => setMode(v)} className="w-full">
        <TabsList className="grid grid-cols-2 mb-4 h-11 bg-slate-100/50 p-1 rounded-xl">
          <TabsTrigger value="draw" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">
            <PenTool className="w-3.5 h-3.5 mr-2" /> Draw
          </TabsTrigger>
          <TabsTrigger value="type" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm font-bold text-xs uppercase tracking-widest">
            <Type className="w-3.5 h-3.5 mr-2" /> Type
          </TabsTrigger>
        </TabsList>

        <TabsContent value="draw" className="mt-0 space-y-4">
           <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/30 overflow-hidden group">
              <canvas 
                ref={canvasRef} 
                className="w-full h-40 cursor-crosshair touch-none"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center opacity-0 group-hover:opacity-10 transition-opacity">
                 <PenTool className="w-20 h-20 text-slate-400" />
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={clear}
                className="absolute bottom-2 right-2 h-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 font-bold"
              >
                <Eraser className="w-3.5 h-3.5 mr-2" /> Clear
              </Button>
           </div>
        </TabsContent>

        <TabsContent value="type" className="mt-0 space-y-4">
           <div className="space-y-4">
              <Input 
                value={typeSignature} 
                onChange={(e) => setTypeSignature(e.target.value)}
                placeholder="Type your name..."
                className="h-12 border-slate-200 focus:border-primary font-medium"
              />
              <div className="border-2 border-dashed border-slate-100 rounded-2xl p-8 flex items-center justify-center min-h-[100px] bg-slate-50/50">
                 <div className="text-4xl font-serif text-slate-900 select-none italic tracking-tight" style={{ fontFamily: "'Brush Script MT', cursive" }}>
                   {typeSignature || "Your Signature"}
                 </div>
              </div>
           </div>
        </TabsContent>
      </Tabs>
      
      <div className="pt-4 flex items-start gap-3 opacity-60">
         <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5" />
         <p className="text-[10px] text-slate-500 leading-tight">
            Our e-signatures are legally compliant under the IT Act 2000. 
            By signing, you confirm that you have read and agreed to the terms of this document.
         </p>
      </div>
    </Card>
  );
}

// Minimal Card wrapper to avoid large imports
function Card({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("rounded-3xl", className)}>{children}</div>;
}
