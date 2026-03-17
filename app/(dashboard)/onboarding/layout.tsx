import { Camera } from "lucide-react";

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="h-16 flex items-center justify-center bg-white border-b sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <Camera className="w-5 h-5 text-accent" />
          </div>
          <span className="font-bold text-xl tracking-tight">StudioDesk</span>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="w-full max-w-2xl">
          {children}
        </div>
      </main>
    </div>
  );
}
