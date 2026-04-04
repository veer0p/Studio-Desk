import { ClientHome } from "@/components/portal/client-dashboard/ClientHome"
import { Suspense } from "react"
import PortalHomeSkeleton from "@/components/skeletons/PortalHomeSkeleton"

export const dynamic = "force-dynamic"

export default async function PortalDashboardPage(props: { params: Promise<{ studioSlug: string }> }) {
  const params = await props.params
  
  return (
    <Suspense fallback={<PortalHomeSkeleton />}>
      <ClientHome studioSlug={params.studioSlug} />
    </Suspense>
  )
}
