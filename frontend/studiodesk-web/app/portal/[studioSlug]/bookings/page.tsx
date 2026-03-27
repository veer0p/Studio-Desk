// app/portal/[studioSlug]/bookings/page.tsx
import { ClientBookingList } from "@/components/portal/client-bookings/ClientBookingList"

export const metadata = { title: "My Bookings | Client Portal" }

export default async function PortalBookingPage(props: { params: Promise<{ studioSlug: string }> }) {
  const params = await props.params
  return <ClientBookingList studioSlug={params.studioSlug} />
}
