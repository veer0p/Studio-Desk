import { notFound } from "next/navigation";
import { ProposalBuilder } from "@/components/proposals/ProposalBuilder";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getBooking(id: string) {
  // Mock booking + client data
  return {
    id,
    title: "Siddharth & Ananya Wedding",
    event_type: "wedding",
    client: {
      full_name: "Siddharth Malhotra",
      email: "sid@example.com",
      phone: "+91 99999 00000",
      state: "Karnataka",
    }
  };
}

async function getPackages() {
  return [
    { id: "P1", name: "Premium Wedding", price: 75000, event_type: "wedding", description: "Full day coverage, 2 photographers" },
    { id: "P2", name: "Classic Wedding", price: 45000, event_type: "wedding", description: "8 hours coverage, 1 photographer" },
    { id: "P3", name: "Pre-Wedding Shoot", price: 25000, event_type: "pre_wedding", description: "4 hours, 2 locations" },
  ];
}

async function getAddons() {
  return [
    { id: "A1", name: "Extra Photographer", price: 15000 },
    { id: "A2", name: "Drone Coverage", price: 10000 },
    { id: "A3", name: "Photo Album (Premium)", price: 8000 },
  ];
}

export default async function NewProposalPage({ params }: { params: { id: string } }) {
  const [booking, packages, addons] = await Promise.all([
    getBooking(params.id),
    getPackages(),
    getAddons()
  ]);

  if (!booking) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" className="rounded-full" asChild>
          <Link href={`/bookings/${params.id}`}>
             <ArrowLeft className="w-4 h-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Create Proposal</h1>
          <p className="text-sm text-muted-foreground mt-1">
            For booking: <span className="font-bold text-slate-900">{booking.title}</span>
          </p>
        </div>
      </div>

      <ProposalBuilder 
        booking={booking} 
        packages={packages} 
        addons={addons} 
      />
    </div>
  );
}
