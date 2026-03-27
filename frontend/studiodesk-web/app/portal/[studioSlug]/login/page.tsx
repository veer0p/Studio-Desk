import { PortalLoginPage } from "@/components/portal/PortalLoginPage"

export default async function ClientLoginPage(props: { params: Promise<{ studioSlug: string }> }) {
  const params = await props.params
  
  return <PortalLoginPage studioSlug={params.studioSlug} />
}
