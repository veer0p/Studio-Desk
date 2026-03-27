"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { submitStudioProfile, submitOwnerProfile, submitTeamMembers, submitPackages, completeOnboardingFlag } from "@/lib/api"
import { Step1Data, Step2Data, Step3Data, Step4Data } from "@/lib/validations/onboarding"
import { CheckCircle2, Store, User, Users, Package } from "lucide-react"

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
      if (formData.step1) await submitStudioProfile(formData.step1)
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
    <div>
      <div className="text-center mb-10">
        <div className="w-16 h-16 bg-primary/10 text-primary flex items-center justify-center rounded-full mx-auto mb-4">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-semibold tracking-tight mb-2">You're all set! 🎉</h2>
        <p className="text-muted-foreground">Review your studio profile before going live.</p>
      </div>
      
      <div className="space-y-4 mb-10">
        {formData.step1 && (
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-muted/10">
            <Store className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">{formData.step1.name}</h4>
              <p className="text-sm text-muted-foreground">
                {formData.step1.type} • {formData.step1.city}, {formData.step1.state}
              </p>
            </div>
          </div>
        )}

        {formData.step2 && (
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-muted/10">
            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">{formData.step2.fullName}</h4>
              <p className="text-sm text-muted-foreground">
                {formData.step2.phone} • {formData.step2.designation || "Owner"}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-muted/10">
            <Users className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">{formData.step3?.members.filter(m => m.name).length || 0} Members</h4>
              <p className="text-sm text-muted-foreground">Team Setup</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-xl border border-border/60 bg-muted/10">
            <Package className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">{formData.step4?.packages.filter(p => p.name).length || 0} Packages</h4>
              <p className="text-sm text-muted-foreground">Service Setup</p>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-8 flex justify-between items-center border-t border-border/40 mt-8">
        <Button variant="ghost" onClick={onBack} disabled={isSubmitting}>
          Back
        </Button>
        <Button onClick={handleGoLive} disabled={isSubmitting} size="lg" className="px-8 font-medium">
          {isSubmitting ? "Setting up..." : "Go to Dashboard \u2192"}
        </Button>
      </div>
    </div>
  )
}
