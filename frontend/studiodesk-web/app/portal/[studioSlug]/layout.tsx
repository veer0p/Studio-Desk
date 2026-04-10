import { PortalShell } from "@/components/portal/PortalShell"
import { PortalAuthProvider } from "@/lib/portal-auth"

export const metadata = {
  title: "Client Portal | Powered by StudioDesk",
  description: "Securely view your bookings, contracts, and proposals.",
}

export default async function PortalLayout(props: {
  children: React.ReactNode,
  params: Promise<{ studioSlug: string }>
}) {
  const params = await props.params

  return (
    <PortalAuthProvider studioSlug={params.studioSlug}>
      <PortalShell studioSlug={params.studioSlug}>
        {props.children}
      </PortalShell>
    </PortalAuthProvider>
  )
}
