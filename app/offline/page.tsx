import { WifiOff, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function OfflinePage() {
  const reload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        <WifiOff className="w-12 h-12 text-slate-400" />
      </div>
      
      <h1 className="text-2xl font-black text-slate-900 mb-2">You&apos;re offline</h1>
      <p className="text-slate-500 max-w-xs mb-8">
        StudioDesk needs an internet connection to sync your data and photos.
      </p>

      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm max-w-sm w-full mb-8">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Pro Tip</p>
        <p className="text-sm text-slate-600">
          Recently viewed photos in your gallery may still be available if they were cached.
        </p>
      </div>

      <Button onClick={reload} className="h-12 px-8 rounded-xl font-bold gap-2">
        <RotateCcw className="w-4 h-4" /> Try Again
      </Button>
    </div>
  );
}
