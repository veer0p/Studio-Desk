"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"

import Step1StudioProfile from "./steps/Step1StudioProfile"
import Step2OwnerDetails from "./steps/Step2OwnerDetails"
import Step3TeamSetup from "./steps/Step3TeamSetup"
import Step4Packages from "./steps/Step4Packages"
import Step5GoLive from "./steps/Step5GoLive"

import type { Step1Data, Step2Data, Step3Data, Step4Data } from "@/lib/validations/onboarding"

const STEPS = [
  "Studio Profile",
  "Owner Details",
  "Team Setup",
  "Packages",
  "Go Live"
]

export default function OnboardingWizard() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [direction, setDirection] = useState(0)
  const [formData, setFormData] = useState<{
    step1?: Step1Data;
    step2?: Step2Data;
    step3?: Step3Data;
    step4?: Step4Data;
  }>({})
  
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleNext = (stepData: any) => {
    setFormData((prev: any) => ({ ...prev, [`step${currentStep}`]: stepData }))
    setDirection(1)
    setCurrentStep((prev: number) => Math.min(prev + 1, 5))
  }

  const handlePrev = () => {
    setDirection(-1)
    setCurrentStep((prev: number) => Math.max(prev - 1, 1))
  }

  const handleSkip = () => {
    setFormData((prev: any) => ({ ...prev, [`step${currentStep}`]: undefined }))
    setDirection(1)
    setCurrentStep((prev: number) => Math.min(prev + 1, 5))
  }

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 50 : -50,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 50 : -50,
      opacity: 0
    })
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <div className="glass-card w-full rounded-3xl p-8 md:p-12 relative overflow-hidden transition-all duration-500 shadow-2xl">
        {/* Loading Overlay */}
        {isSubmitting && (
          <div className="absolute inset-0 z-50 bg-background/60 backdrop-blur-md flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
            <p className="text-sm font-semibold text-foreground animate-pulse tracking-wide">
              Crafting your workspace...
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-4 mb-12">
          <div className="flex gap-1.5 sm:gap-3">
            {STEPS.map((_, idx) => (
              <div
                key={idx}
                className="h-1.5 flex-1 rounded-full bg-muted/30 overflow-hidden"
              >
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ 
                    width: idx < currentStep ? "100%" : "0%",
                    backgroundColor: idx === currentStep - 1 ? "var(--primary)" : "rgb(var(--primary) / 0.4)"
                  }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="h-full rounded-full"
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between items-center">
            <p className="text-xs sm:text-sm text-muted-foreground font-medium uppercase tracking-widest">
              Step {currentStep} <span className="mx-1">/</span> {STEPS.length}
            </p>
            <h3 className="text-sm sm:text-base font-bold text-foreground">
              {STEPS[currentStep - 1]}
            </h3>
          </div>
        </div>

        {/* Step Content */}
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={currentStep}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{
                x: { type: "spring", stiffness: 300, damping: 30 },
                opacity: { duration: 0.2 }
              }}
              className="w-full"
            >
              {currentStep === 1 && (
                <Step1StudioProfile initialData={formData.step1} onNext={handleNext} />
              )}
              {currentStep === 2 && (
                <Step2OwnerDetails initialData={formData.step2} onNext={handleNext} onBack={handlePrev} />
              )}
              {currentStep === 3 && (
                <Step3TeamSetup initialData={formData.step3} onNext={handleNext} onBack={handlePrev} onSkip={handleSkip} />
              )}
              {currentStep === 4 && (
                <Step4Packages initialData={formData.step4} onNext={handleNext} onBack={handlePrev} onSkip={handleSkip} />
              )}
              {currentStep === 5 && (
                <Step5GoLive 
                  formData={formData} 
                  onBack={handlePrev} 
                  isSubmitting={isSubmitting}
                  setIsSubmitting={setIsSubmitting}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer Branding */}
      <div className="mt-8 text-center sm:block hidden">
        <p className="text-sm text-muted-foreground/60 font-medium tracking-tight">
          Powered by <span className="text-foreground/80 font-bold">StudioDesk</span>
        </p>
      </div>
    </div>
  )
}
