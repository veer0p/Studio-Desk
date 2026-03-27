"use client"

import useSWR from "swr"
import { fetcher } from "@/lib/api"
import { useSearchParams } from "next/navigation"
import ClientCard from "./ClientCard"
import { Skeleton } from "@/components/ui/skeleton"

export default function ClientsGrid() {
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const { data, isLoading } = useSWR(`/api/v1/clients?${queryString}`, fetcher, { dedupingInterval: 60000 })

  if (isLoading) {
    return (
      <div className="w-full flex-1 overflow-auto custom-scrollbar p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <Skeleton key={i} className="col-span-1 h-[340px] rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const clients = data?.list || []

  if (clients.length === 0) {
    return (
      <div className="flex items-center justify-center p-12 text-center flex-1 h-full w-full">
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
            <span className="text-2xl text-muted-foreground opacity-50">👤</span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight">No clients found</h2>
          <p className="text-sm text-muted-foreground mt-2 max-w-sm">
            Try adjusting your search or filters, or create a new client to get started.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full flex-1 overflow-auto custom-scrollbar p-6 bg-muted/10 h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-8">
        {clients.map((client: any) => (
          <ClientCard key={client.id} client={client} />
        ))}
      </div>
    </div>
  )
}
