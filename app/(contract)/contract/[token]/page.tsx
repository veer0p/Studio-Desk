import { Metadata } from "next";
import { getPublicPageMetadata } from "@/lib/metadata";
import PublicContractClient from "@/components/contracts/PublicContractClient";

// Mock data fetching (simulating DB query by token)
async function getContractByToken(token: string) {
  return {
    id: "CON-445902",
    status: "sent",
    created_at: "2024-03-12",
    studio: {
      name: "Pixel Perfection Studios",
      address: "123 Photography Lane, Bangalore",
    },
    booking: {
      title: "Siddharth & Ananya Wedding",
      event_date: "June 15, 2024",
    },
    client: {
      full_name: "Siddharth Malhotra",
      email: "sid@example.com",
    },
    content_html: `
      <h1>Photography Services Agreement</h1>
      <p>This agreement is made between <strong>Pixel Perfection Studios</strong> and <strong>Siddharth Malhotra</strong>.</p>
      <p>1. <strong>Creative License</strong>: The Studio shall be granted artistic license in relation to the poses photographed and the locations used. The Studio’s judgment regarding the quality and composition of the photographs shall be deemed correct.</p>
      <p>2. <strong>Copyright and Image Rights</strong>: The Studio retains the copyright to all images. The Client is granted a personal use license for sharing and printing.</p>
      <p>3. <strong>Liability</strong>: In the unlikely event of total photographic failure or cancellation of this contract by either party or in any other circumstance, the liability of one party to the other shall be limited to the total value of the contract.</p>
      <p>4. <strong>Governing Law</strong>: This agreement shall be governed by the laws of India.</p>
    `
  };
}

export async function generateMetadata({ params }: { params: { token: string } }): Promise<Metadata> {
  const contract = await getContractByToken(params.token);
  return getPublicPageMetadata({
    studioName: contract.studio.name,
    title: `Contract: ${contract.booking.title} | ${contract.studio.name}`,
    description: `Secure digital agreement for ${contract.booking.title}. Please review and sign.`,
    noIndex: true, // Don't index private contracts
  });
}

export default async function PublicContractPage({ params }: { params: { token: string } }) {
  const contract = await getContractByToken(params.token);
  
  return <PublicContractClient contract={contract} />;
}

