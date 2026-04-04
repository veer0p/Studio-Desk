import { Suspense } from "react"
import ClientsShell from "@/components/clients/ClientsShell"
import ClientsTable from "@/components/clients/ClientsTable"
import ClientsGrid from "@/components/clients/ClientsGrid"

export const dynamic = "force-dynamic"

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
    <ClientsShell>
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Loading View...</div>}>
        {isGridView ? (
          <ClientsGrid />
        ) : (
          <ClientsTable />
        )}
      </Suspense>
    </ClientsShell>
  )
}