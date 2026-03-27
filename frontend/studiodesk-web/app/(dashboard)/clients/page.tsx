import { Suspense } from "react"
import ClientsShell from "@/components/clients/ClientsShell"
import ClientsTable from "@/components/clients/ClientsTable"
import ClientsGrid from "@/components/clients/ClientsGrid"

export const metadata = {
  title: "Clients | StudioDesk",
  description: "Manage your studio clients and CRM",
}

export default async function ClientsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string }>
}) {
  const { view } = await searchParams
  const isGridView = view === "grid"

  return (
    <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading Contacts...</div>}>
      <ClientsShell>
        {isGridView ? (
          <ClientsGrid />
        ) : (
          <ClientsTable />
        )}
      </ClientsShell>
    </Suspense>
  )
}