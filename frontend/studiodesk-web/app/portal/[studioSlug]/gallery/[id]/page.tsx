// app/portal/[studioSlug]/gallery/[id]/page.tsx
import { redirect } from "next/navigation"

export default async function PortalGalleryRedirect(props: { params: Promise<{ id: string }> }) {
  // Directly intercepts ID requests forcing structural drop into explicit slug paths ensuring public PIN hooks work safely.
  const params = await props.params
  redirect(`/gallery/p/${params.id}`)
}
