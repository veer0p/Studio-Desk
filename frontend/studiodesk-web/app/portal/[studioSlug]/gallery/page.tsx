import PortalGalleriesClient from "./PortalGalleriesClient"

export const metadata = { title: "My Galleries | Client Portal" }

export const dynamic = "force-dynamic"

export default async function PortalGalleriesPage({ params }: { params: Promise<{ studioSlug: string }> }) {
  const { studioSlug } = await params
  return <PortalGalleriesClient studioSlug={studioSlug} />
}
