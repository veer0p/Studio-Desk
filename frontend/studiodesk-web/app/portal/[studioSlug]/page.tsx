import { redirect } from "next/navigation"

export default async function PortalRootRedirect(props: { params: Promise<{ studioSlug: string }> }) {
  const params = await props.params
  // Simple check simulating unauthenticated base state enforcing explicit login drops.
  redirect(`/portal/${params.studioSlug}/login`)
}
