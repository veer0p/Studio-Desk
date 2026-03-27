// app/portal/[studioSlug]/invoices/[id]/page.tsx
import { ClientInvoiceViewer } from "@/components/portal/client-invoices/ClientInvoiceViewer"

export const metadata = { title: "Invoice Details | Client Portal" }

export default async function PortalInvoiceDetail(props: { params: Promise<{ studioSlug: string, id: string }> }) {
  const params = await props.params
  return (
    <div className="max-w-4xl mx-auto">
       <ClientInvoiceViewer studioSlug={params.studioSlug} invoiceId={params.id} />
    </div>
  )
}
