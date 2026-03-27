// app/portal/[studioSlug]/proposals/[id]/page.tsx
import { ProposalViewer } from "@/components/portal/client-proposals/ProposalViewer"

export const metadata = { title: "Proposal Package | Client Portal" }

export default async function PortalProposalPage(props: { params: Promise<{ studioSlug: string, id: string }> }) {
  const params = await props.params
  return (
    <div className="max-w-3xl mx-auto">
      <ProposalViewer studioSlug={params.studioSlug} proposalId={params.id} />
    </div>
  )
}
