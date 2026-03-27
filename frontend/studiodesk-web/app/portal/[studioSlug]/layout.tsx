import { PortalShell } from "@/components/portal/PortalShell"

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
    <PortalShell studioSlug={params.studioSlug}>
      {props.children}
    </PortalShell>
  )
}
