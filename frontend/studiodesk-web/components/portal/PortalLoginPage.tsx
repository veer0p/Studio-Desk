"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { User, Smartphone, Mail, ArrowRight, ShieldCheck, Asterisk } from "lucide-react"

export function PortalLoginPage({ studioSlug }: { studioSlug: string }) {
  const router = useRouter()
  
  const [method, setMethod] = useState<"phone" | "email">("phone")
  const [step, setStep] = useState<"input" | "otp">("input")
  
  const [phone, setPhone] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [isVerifying, setIsVerifying] = useState(false)

  const studioName = studioSlug.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ')

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault()
    if (phone.length === 10) setStep("otp")
  }

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const pasted = value.slice(0, 6).split("")
      const newOtp = [...otp]
      pasted.forEach((char, i) => { if (index + i < 6) newOtp[index + i] = char })
      setOtp(newOtp)
      // Focus last filled
      const nextIdx = Math.min(index + pasted.length, 5)
      document.getElementById(`otp-${nextIdx}`)?.focus()
      return
    }
    
    // Normal single stroke
    const newOtp = [...otp]
    newOtp[index] = value
    setOtp(newOtp)

    if (value !== "" && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus()
    }
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && otp[index] === "" && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus()
    }
  }

  const handleVerify = () => {
    setIsVerifying(true)
    setTimeout(() => {
      router.push(`/portal/${studioSlug}/dashboard`)
    }, 800)
  }

  const handleEmailLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setIsVerifying(true)
    setTimeout(() => {
      router.push(`/portal/${studioSlug}/dashboard`)
    }, 800)
  }

  return (
    <div className="w-full flex flex-col items-center">
      
      {/* Studio Header Context */}
      <div className="mb-10 text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-primary/20">
          <User className="w-8 h-8 text-primary" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">{studioName}</h1>
        <p className="text-sm text-muted-foreground mt-1.5">Client Portal Access</p>
      </div>

      {/* Main Auth Card */}
      <div className="w-full bg-card border border-border/60 rounded-2xl p-6 md:p-8 shadow-sm relative overflow-hidden">
        
        {method === "phone" && step === "input" && (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold tracking-tight mb-2">Welcome back</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter your registered mobile number to receive a secure login code via SMS.</p>
            
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div className="space-y-2">
                <Label>Mobile Number</Label>
                <div className="relative flex items-center">
                  <div className="absolute left-0 pl-3 flex items-center gap-1.5 border-r border-border/60 pr-2 pointer-events-none">
                    <span className="text-muted-foreground text-sm font-medium">+91</span>
                  </div>
                  <Input 
                    type="tel" 
                    placeholder="98765 43210" 
                    className="pl-14 text-base tracking-widest font-mono"
                    maxLength={10}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={phone.length !== 10}>
                Send Secure Code <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
              <button onClick={() => setMethod("email")} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors">
                <Mail className="w-4 h-4" /> Use Email instead
              </button>
            </div>
          </div>
        )}

        {method === "phone" && step === "otp" && (
          <div className="animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 mb-4 text-emerald-600 border border-emerald-500/20">
               <ShieldCheck className="w-6 h-6" />
             </div>
             <h2 className="text-xl font-bold tracking-tight mb-2">Verify it's you</h2>
             <p className="text-sm text-muted-foreground mb-6">
               Enter the 6-digit code sent to <strong className="text-foreground tracking-wider">+91 {phone.slice(0,5)} {phone.slice(5)}</strong>.
               <button onClick={() => setStep("input")} className="text-primary hover:underline ml-2">Change</button>
             </p>

             <div className="flex gap-2 justify-center mb-8">
               {otp.map((digit, idx) => (
                 <Input 
                   key={idx}
                   id={`otp-${idx}`}
                   type="text"
                   inputMode="numeric"
                   maxLength={1}
                   value={digit}
                   onChange={(e) => handleOtpChange(idx, e.target.value)}
                   onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                   className="w-12 h-14 text-center text-xl font-bold font-mono px-0 border-border/80 focus:border-primary focus-visible:ring-primary/20 shadow-sm"
                 />
               ))}
             </div>

             <Button className="w-full font-semibold" disabled={otp.join('').length !== 6 || isVerifying} onClick={handleVerify}>
               {isVerifying ? "Verifying Session..." : "Verify & Login"}
             </Button>

             <div className="mt-6 text-center">
               <p className="text-xs text-muted-foreground">Didn't receive code? <button className="text-foreground font-medium ml-1">Resend in 0:28</button></p>
             </div>
          </div>
        )}

        {method === "email" && (
           <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-bold tracking-tight mb-2">Login with Email</h2>
            <p className="text-sm text-muted-foreground mb-6">Enter your credentials provided during booking creation safely.</p>
            
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div className="space-y-2">
                <Label>Email Address</Label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input type="email" placeholder="client@example.com" className="pl-9" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
              </div>
               <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Password</Label>
                  <button type="button" className="text-xs text-primary font-medium hover:underline">Forgot?</button>
                </div>
                <div className="relative">
                  <Asterisk className="w-4 h-4 absolute left-3 top-2.5 text-muted-foreground" />
                  <Input type="password" placeholder="••••••••" className="pl-9" value={password} onChange={e => setPassword(e.target.value)} />
                </div>
              </div>

              <Button type="submit" className="w-full font-semibold" disabled={!email || !password || isVerifying}>
                {isVerifying ? "Authenticating..." : "Access Portal"}
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/40 text-center">
              <button onClick={() => { setMethod("phone"); setStep("input") }} className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-2 transition-colors">
                <Smartphone className="w-4 h-4" /> Use Phone Number instead
              </button>
            </div>
          </div>
        )}

      </div>
    
      {/* Privacy Notice */}
      <p className="text-center text-[10px] text-muted-foreground/60 mt-8 max-w-xs">
        By accessing this portal, you agree to the StudioDesk End Client terms of service structurally guarding your private gallery artifacts safely.
      </p>

    </div>
  )
}
