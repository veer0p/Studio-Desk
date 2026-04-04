"use client"

import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { CheckCircle2, Store, User, Users, Package, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { submitStudioProfile, submitOwnerProfile, submitTeamMembers, submitPackages, completeOnboardingFlag } from "@/lib/api"
import { Step1Data, Step2Data, Step3Data, Step4Data } from "@/lib/validations/onboarding"

interface Step5Props {
  formData: {
    step1?: Step1Data;
    step2?: Step2Data;
    step3?: Step3Data;
    step4?: Step4Data;
  };
  onBack: () => void;
  isSubmitting: boolean;
  setIsSubmitting: (val: boolean) => void;
}

export default function Step5GoLive({ formData, onBack, isSubmitting, setIsSubmitting }: Step5Props) {
  const router = useRouter()

  const handleGoLive = async () => {
    setIsSubmitting(true)
    try {
      if (formData.step1) await submitStudioProfile(formData.step1, formData.step2?.phone)
      if (formData.step2) await submitOwnerProfile(formData.step2)
      if (formData.step3 && formData.step3.members.length > 0) await submitTeamMembers(formData.step3)
      if (formData.step4 && formData.step4.packages.length > 0) await submitPackages(formData.step4)
      await completeOnboardingFlag()

      router.push("/dashboard")
      router.refresh()
    } catch (error) {
      console.error("[ONBOARDING_API_ERROR]", error)
      alert("Failed to complete onboarding. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-10">
      <div className="text-center">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="w-20 h-20 bg-primary/20 text-primary flex items-center justify-center rounded-full mx-auto mb-6 shadow-xl shadow-primary/10"
        >
          <CheckCircle2 className="w-10 h-10" />
        </motion.div>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-3">
          You're all set! 🎉
        </h2>
        <p className="text-lg text-muted-foreground max-w-md mx-auto">
          Your studio workspace is ready. Review your summary below before stepping into your dashboard.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex items-center gap-6 p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-xl group"
        >
          <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform shadow-lg shadow-blue-500/10">
            <Store className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-blue-500/80 mb-1.5">Studio Details</p>
            <h4 className="text-2xl font-black text-foreground tracking-tight leading-none mb-2">{formData.step1?.name || "My Studio"}</h4>
            <p className="text-sm text-muted-foreground font-medium">
              {formData.step1?.type} • {formData.step1?.city}
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="flex items-center gap-6 p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-xl group"
        >
          <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform shadow-lg shadow-purple-500/10">
            <User className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-purple-500/80 mb-1.5">Owner Profile</p>
            <h4 className="text-2xl font-black text-foreground tracking-tight leading-none mb-2">{formData.step2?.fullName || "Owner"}</h4>
            <p className="text-sm text-muted-foreground font-medium">
              {formData.step2?.phone}
            </p>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-6 p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-xl group"
        >
          <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform shadow-lg shadow-green-500/10">
            <Users className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-500/80 mb-1.5">Team</p>
            <h4 className="text-2xl font-black text-foreground tracking-tight">
              {formData.step3?.members.filter(m => m.name).length || 0} Members
            </h4>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="flex items-center gap-6 p-8 rounded-3xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all shadow-xl group"
        >
          <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform shadow-lg shadow-orange-500/10">
            <Package className="w-7 h-7" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-orange-500/80 mb-1.5">Offerings</p>
            <h4 className="text-2xl font-black text-foreground tracking-tight">
              {formData.step4?.packages.filter(p => p.name).length || 0} Packages
            </h4>
          </div>
        </motion.div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-6">
        <Button 
          variant="ghost" 
          onClick={onBack} 
          disabled={isSubmitting}
          className="text-muted-foreground hover:bg-white/5 h-12 px-8 w-full sm:w-auto"
        >
          Wait, I need to edit
        </Button>
        <Button 
          onClick={handleGoLive} 
          disabled={isSubmitting} 
          size="lg" 
          className="h-14 px-12 font-extrabold text-lg shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all duration-500 w-full sm:w-auto group"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full" />
              <span>Launching...</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span>Go to Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </div>
          )}
        </Button>
      </div>
    </div>
  )
}
