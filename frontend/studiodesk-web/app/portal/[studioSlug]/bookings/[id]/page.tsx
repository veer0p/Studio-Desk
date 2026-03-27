// app/portal/[studioSlug]/bookings/[id]/page.tsx
import { ClientBookingDetail } from "@/components/portal/client-bookings/ClientBookingDetail"

export const metadata = { title: "Booking Details | Client Portal" }

export default async function PortalBookingDetailPage(props: { params: Promise<{ studioSlug: string, id: string }> }) {
  const params = await props.params
  return <ClientBookingDetail studioSlug={params.studioSlug} bookingId={params.id} />
}
