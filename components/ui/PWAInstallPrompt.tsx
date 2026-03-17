"use client";

import { usePWAInstall } from "@/lib/pwa-utils";
import { Button } from "./button";
import { Download, X, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";
import { Card } from "./card";

export function PWAInstallPrompt() {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Delay showing the prompt to not overwhelm the user immediately
    if (isInstallable && !isInstalled) {
      const timer = setTimeout(() => setIsVisible(true), 5000);
      return () => clearTimeout(timer);
    }
  }, [isInstallable, isInstalled]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-24 left-4 right-4 z-50 animate-in slide-in-from-bottom-10 fade-in duration-500">
      <Card className="bg-slate-900 text-white p-6 shadow-2xl border-none relative overflow-hidden">
        <div className="absolute top-0 right-0 p-2">
           <button onClick={() => setIsVisible(false)} className="text-white/40 hover:text-white transition-colors">
              <X className="w-4 h-4" />
           </button>
        </div>

        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-white relative">
              <Download className="w-6 h-6" />
              <div className="absolute -top-1 -right-1">
                 <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
           </div>
           
           <div className="flex-1 space-y-1">
              <h3 className="font-bold text-sm">Install StudioDesk</h3>
              <p className="text-[10px] text-white/60 font-medium">Get a faster experience & offline access.</p>
           </div>

           <Button 
             variant="default" 
             className="bg-white text-slate-900 hover:bg-slate-100 font-black text-xs h-10 px-6 rounded-xl"
             onClick={install}
           >
              INSTALL
           </Button>
        </div>
      </Card>
    </div>
  );
}
