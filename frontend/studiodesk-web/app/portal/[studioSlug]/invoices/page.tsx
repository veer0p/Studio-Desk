// app/portal/[studioSlug]/invoices/page.tsx
import { ClientInvoiceList } from "@/components/portal/client-invoices/ClientInvoiceList"

export const metadata = { title: "Invoices & Payments | Client Portal" }

export default async function PortalInvoicesPage(props: { params: Promise<{ studioSlug: string }> }) {
  const params = await props.params
  return <ClientInvoiceList studioSlug={params.studioSlug} />
}
