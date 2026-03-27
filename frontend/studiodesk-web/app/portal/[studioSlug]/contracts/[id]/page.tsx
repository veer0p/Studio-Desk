// app/portal/[studioSlug]/contracts/[id]/page.tsx
import { ContractViewer } from "@/components/portal/client-contracts/ContractViewer"

export const metadata = { title: "Legal Agreement | Client Portal" }

export default async function PortalContractPage(props: { params: Promise<{ studioSlug: string, id: string }> }) {
  const params = await props.params
  return (
    <div className="max-w-4xl mx-auto">
      <ContractViewer studioSlug={params.studioSlug} contractId={params.id} />
    </div>
  )
}
