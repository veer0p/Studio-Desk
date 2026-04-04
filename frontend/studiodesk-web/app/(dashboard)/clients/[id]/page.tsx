import { Suspense } from "react"
import ClientDetailPage from "@/components/clients/ClientDetailPage"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Client Details | StudioDesk",
  description: "View and manage CRM profiles",
}

export default async function ClientPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <Suspense fallback={<div className="p-8 text-center text-muted-foreground animate-pulse">Fetching 360 Client View...</div>}>
        <ClientDetailPage clientId={id} />
      </Suspense>
    </div>
  )
}