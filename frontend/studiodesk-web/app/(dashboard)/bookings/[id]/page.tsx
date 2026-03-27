import MobileBookingDetail from "@/components/bookings/MobileBookingDetail"

export const metadata = {
  title: "Booking Detail | StudioDesk",
  description: "View booking details",
}

export default async function BookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <MobileBookingDetail id={id} />
}