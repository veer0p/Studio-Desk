import { notFound } from "next/navigation";
import PublicInquiryForm from "@/components/leads/PublicInquiryForm";
import { Metadata } from "next";
import { getPublicPageMetadata } from "@/lib/metadata";

// This would normally fetch from your DB based on slug
async function getStudioBySlug(slug: string) {
  // Mock studio data
  if (slug === "pixel-perfection") {
    return {
      id: "S1",
      name: "Pixel Perfection Studios",
      slug: "pixel-perfection",
      logo_url: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=200&h=200&auto=format&fit=crop",
      brand_color: "#1A3C5E",
      config: {
        form_title: "Let's Create Magic Together",
        button_text: "Send Request",
        show_event_type: true,
        show_event_date: true,
        show_venue: true,
        show_message: true,
      }
    };
  }
  return null;
}

export async function generateMetadata(
  { params }: { params: { token: string } }
): Promise<Metadata> {
  const studio = await getStudioBySlug(params.token);

  
  if (!studio) return {};

  return getPublicPageMetadata({
    studioName: studio.name,
    title: `Book ${studio.name} | Inquiry`,
    description: `Professional photography inquiry form for ${studio.name}. Tell us about your event and let's capture your story.`,
    imageUrl: studio.logo_url,
  });
}


export default async function PublicInquiryPage({ params }: { params: { token: string } }) {
  const studio = await getStudioBySlug(params.token);


  if (!studio) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 md:py-24 px-4">
       <div className="max-w-4xl mx-auto">
          {/* Logo / Studio Header */}
          <div className="text-center mb-12">
             <div className="w-20 h-20 bg-primary rounded-2xl mx-auto flex items-center justify-center text-white text-3xl font-black mb-6 shadow-xl">
               {studio.name.charAt(0)}
             </div>
             <h2 className="text-xl font-bold text-slate-800">{studio.name}</h2>
          </div>

          <PublicInquiryForm studio={studio} config={studio.config} />
       </div>
    </div>
  );
}
