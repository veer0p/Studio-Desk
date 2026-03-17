import Link from "next/link";
import { Camera, CheckCircle2 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* Left side: Brand Panel (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between bg-primary p-12 text-white relative overflow-hidden">
        {/* CSS Grid Dot Pattern */}
        <div 
          className="absolute inset-0 opacity-10" 
          style={{ 
            backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", 
            backgroundSize: "24px 24px" 
          }} 
        />
        
        <div className="relative z-10">
          <Link href="/" className="flex items-center gap-2 mb-12">
            <Camera className="w-8 h-8 text-accent" />
            <span className="text-2xl font-bold tracking-tight">StudioDesk</span>
          </Link>

          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">
              Run your entire studio — <br />
              <span className="text-accent underline decoration-accent/30 underline-offset-8">from inquiry to delivery.</span>
            </h1>
            <p className="text-lg text-white/80 max-w-md">
              The India-native SaaS for event photographers. 
              Manage leads, invoices, and AI-powered galleries in one place.
            </p>

            <ul className="space-y-4 pt-8">
              {[
                "GST-compliant invoicing & Indian payments",
                "AI-powered photo delivery with face detection",
                "Automated WhatsApp & Email notifications"
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-brand-teal" />
                  <span className="text-white/90">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="relative z-10 pt-12 border-t border-white/10 text-white/60 text-sm">
          &copy; {new Date().getFullYear()} StudioDesk. All rights reserved.
        </div>
      </div>

      {/* Right side: Auth Form Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 bg-slate-50 lg:bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="flex items-center gap-2 text-primary">
              <Camera className="w-8 h-8 text-accent" />
              <span className="text-2xl font-bold">StudioDesk</span>
            </div>
          </div>
          
          <div className="bg-white p-8 rounded-xl lg:p-0 lg:rounded-none lg:bg-transparent shadow-sm lg:shadow-none">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
