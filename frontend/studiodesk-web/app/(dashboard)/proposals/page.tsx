import { ProposalsShell } from "@/components/proposals/ProposalsShell"
import { ProposalList } from "@/components/proposals/ProposalList"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Proposals | StudioDesk",
  description: "Manage and track your business proposals",
}

export default function ProposalsPage() {
  return (
    <ProposalsShell>
      <ProposalList />
    </ProposalsShell>
  )
}
