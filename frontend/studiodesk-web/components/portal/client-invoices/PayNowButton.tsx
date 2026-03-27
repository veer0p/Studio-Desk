// components/portal/client-invoices/PayNowButton.tsx
"use client"

import { useState } from "react"
import { ShieldCheck, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PayNowButton({ balance, studioSlug }: { balance: number, studioSlug: string }) {
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleRazorpay = async () => {
    setLoading(true)
    
    // Simulate Razorpay API call architecture mapped safely.
    // 1. Fetch Order ID from /api/v1/portal/invoices/[id]/create-order
    // 2. Open Razorpay Checkbox
    
    setTimeout(() => {
       setLoading(false)
       setSuccess(true)
    }, 1500)
  }

  if (success) {
    return (
      <div className="w-full bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-center gap-3 text-emerald-600 animate-in zoom-in-95 duration-300">
         <ShieldCheck className="w-5 h-5" />
         <p className="font-bold tracking-tight">Payment of ₹{balance.toLocaleString('en-IN')} Received!</p>
      </div>
    )
  }

  return (
    <div className="w-full">
       <Button 
         size="lg" 
         onClick={handleRazorpay} 
         disabled={loading}
         className="w-full h-14 bg-[hsl(var(--portal-primary))] hover:bg-[hsl(var(--portal-primary))/90] text-lg font-bold tracking-tight shadow-md"
       >
         {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Processing Securely...</>
         ) : (
            `Pay ₹${balance.toLocaleString('en-IN')}`
         )}
       </Button>
       
       <div className="flex items-center justify-center gap-4 mt-4">
         {/* Native India-First Razorpay trust badges */}
         <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/UPI-Logo-vector.svg/1024px-UPI-Logo-vector.svg.png" className="h-4 opacity-50 grayscale hover:grayscale-0 transition-all" alt="UPI" />
         <div className="w-1 h-1 rounded-full bg-border/80" />
         <span className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">Secured by Razorpay</span>
       </div>
    </div>
  )
}
