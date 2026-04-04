import { ClientInvoiceList } from "@/components/portal/client-invoices/ClientInvoiceList"
import { Suspense } from "react"
import PortalInvoicesSkeleton from "@/components/skeletons/PortalInvoicesSkeleton"

export const dynamic = "force-dynamic"

export const metadata = { title: "Invoices & Payments | Client Portal" }

export default async function PortalInvoicesPage(props: { params: Promise<{ studioSlug: string }> }) {
  const params = await props.params
  return (
    <Suspense fallback={<PortalInvoicesSkeleton />}>
      <ClientInvoiceList studioSlug={params.studioSlug} />
    </Suspense>
  )
}
