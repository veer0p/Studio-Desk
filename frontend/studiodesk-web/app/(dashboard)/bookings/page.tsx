import BookingsClient from "./BookingsClient"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Bookings | StudioDesk",
  description: "Manage your studio bookings and pipeline",
}

export default function BookingsPage() {
  return <BookingsClient />
}