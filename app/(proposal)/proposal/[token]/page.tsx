import { Metadata } from "next";
import { getPublicPageMetadata } from "@/lib/metadata";
import PublicProposalClient from "@/components/proposals/PublicProposalClient";

// Mock data fetching (simulating DB query by token)
async function getProposalByToken(token: string) {
  return {
    id: "PRP-829102",
    status: "sent",
    created_at: "2024-03-10",
    valid_until: "2024-03-24",
    total_amount: 59000,
    advance_amount: 17700,
    balance_amount: 41300,
    notes: "Includes all raw images and 50 edited photos in a premium gallery.",
    line_items: [
      { id: "1", name: "Premium Wedding Photography", description: "Full day coverage, 2 senior photographers", qty: 1, unit_price: 50000 },
    ],
    studio: {
      name: "Pixel Perfection Studios",
      tagline: "Capturing Every Precious Whisper",
      email: "hello@pixelperfection.com",
      logo_url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=200&h=200&auto=format&fit=crop",
    },
    booking: {
      title: "Siddharth & Ananya Wedding",
      event_type: "Wedding",
      event_date: "2024-06-15",
      venue: "The Leela Palace, Bangalore",
    },
    client: {
      full_name: "Siddharth Malhotra",
    }
  };
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const proposal = await getProposalByToken(params.token);
  return getPublicPageMetadata({
    studioName: proposal.studio.name,
    title: `Proposal: ${proposal.booking.title} | ${proposal.studio.name}`,
    description: `Professional photography proposal for ${proposal.booking.title}. Review your package and secure your date.`,
    imageUrl: proposal.studio.logo_url,
    noIndex: true,
  });
}

export default async function PublicProposalPage({ params }: { params: { token: string } }) {
  const proposal = await getProposalByToken(params.token);
  
  return <PublicProposalClient proposal={proposal} token={params.token} />;
}

