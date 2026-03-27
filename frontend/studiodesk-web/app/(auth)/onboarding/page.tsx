import OnboardingWizard from "@/components/onboarding/OnboardingWizard"

export const metadata = {
  title: "Onboarding | StudioDesk",
  description: "Set up your StudioDesk workspace",
}

export default function OnboardingPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4 md:p-8 relative">
      <OnboardingWizard />
    </div>
  )
}
