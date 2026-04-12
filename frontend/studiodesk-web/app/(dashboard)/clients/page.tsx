import ClientDirectory from "@/components/crm/ClientDirectory"

export const metadata = {
  title: "Clients | StudioDesk",
  description: "Artisan Operations Dashboard - Client CRM",
}

export default function ClientsPage() {
  return (
    <div className="flex-1 w-full h-full overflow-hidden flex flex-col bg-background">
      <ClientDirectory />
    </div>
  )
}