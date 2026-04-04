import { ClientBookingList } from "@/components/portal/client-bookings/ClientBookingList"
import { Suspense } from "react"
import PortalBookingsSkeleton from "@/components/skeletons/PortalBookingsSkeleton"

export const dynamic = "force-dynamic"

export default async function PortalBookingsPage(props: { params: Promise<{ studioSlug: string }> }) {
  const params = await props.params
  
  return (
    <Suspense fallback={<PortalBookingsSkeleton />}>
      <ClientBookingList studioSlug={params.studioSlug} />
    </Suspense>
  )
}
