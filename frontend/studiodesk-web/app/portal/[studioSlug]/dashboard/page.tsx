// app/portal/[studioSlug]/dashboard/page.tsx
import { ClientHome } from "@/components/portal/client-dashboard/ClientHome"

export default async function PortalDashboardPage(props: { params: Promise<{ studioSlug: string }> }) {
  const params = await props.params
  
  return <ClientHome studioSlug={params.studioSlug} />
}
