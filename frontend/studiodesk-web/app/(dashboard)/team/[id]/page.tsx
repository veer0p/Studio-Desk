import { use } from "react"
import { MemberDetail } from "@/components/team/members/MemberDetail"

export default function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  
  // Directly intercept NextJS segments mapping detail view natively
  return (
    <main className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <MemberDetail id={resolvedParams.id} />
    </main>
  )
}
