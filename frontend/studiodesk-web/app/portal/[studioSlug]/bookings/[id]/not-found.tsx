import Link from "next/link"
import { ArrowLeft, FileSearch } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8 text-center">
      <FileSearch className="w-12 h-12 text-muted-foreground mb-4" />
      <h2 className="text-2xl font-bold tracking-tight mb-2">Booking not found</h2>
      <p className="text-muted-foreground mb-6 max-w-sm">
        This booking may have been canceled or the link is incorrect.
      </p>
      <Button asChild variant="outline">
        <Link href="/portal/bookings">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to bookings
        </Link>
      </Button>
    </div>
  )
}
