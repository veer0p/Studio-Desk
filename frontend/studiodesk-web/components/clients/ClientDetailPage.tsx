"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useState } from "react"
import useSWR from "swr"
import { fetchClientDetail } from "@/lib/api"
import { useSearchParams, useRouter } from "next/navigation"
import { ClientAvatar } from "./shared/ClientAvatar"
import { Button } from "@/components/ui/button"
import { EditClientSheet } from "./EditClientSheet"
import { ClientOverview } from "./tabs/ClientOverview"
import { ClientBookings } from "./tabs/ClientBookings"
import { ClientFinance } from "./tabs/ClientFinance"
import { ClientCommunication } from "./tabs/ClientCommunication"
import { ClientDocuments } from "./tabs/ClientDocuments"
import { ChevronLeft, MessageCircle, MoreHorizontal, Plus } from "lucide-react"
import { whatsappUrl } from "@/lib/phone"
import { ROUTES } from "@/lib/constants/routes"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const formatAmount = (amt: number) => {
  if (!amt) return "₹0"
  if (amt >= 100000) return `₹${(amt / 100000).toFixed(1)}L`
  if (amt >= 1000) return `₹${(amt / 1000).toFixed(0)}K`
  return `₹${amt}`
}

export default function ClientDetailPage({ clientId }: { clientId: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentTab = searchParams.get("tab") || "overview"

  const { data: client, isLoading, error } = useSWR(`/api/v1/clients/${clientId}`, fetchClientDetail, { dedupingInterval: 10000 })

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/clients/${clientId}?${params.toString()}`, { scroll: false })
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="w-full h-32 rounded-md" />
        <Skeleton className="w-full h-[400px] rounded-md" />
      </div>
    )
  }

  if (error) {
    const isNotFound = error?.status === 404
    return (
      <div className="p-8 flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">
          {isNotFound ? "Client not found." : "Failed to load client details."}
        </p>
        <Button onClick={() => router.push(ROUTES.CLIENTS)}>Back to clients</Button>
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-8 flex items-center justify-center flex-col gap-4">
        <p className="text-muted-foreground">No client data available.</p>
        <Button onClick={() => router.push(ROUTES.CLIENTS)}>Back to clients</Button>
      </div>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "bookings", label: `Bookings (${client.bookingsCount || 0})` },
    { id: "finance", label: "Finance" },
    { id: "communication", label: "Communication" },
    { id: "documents", label: "Documents" },
  ]

  const whatsappPhone = client.whatsapp || client.phone || ""
  const whatsappLink = whatsappUrl(whatsappPhone)

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      
      {/* Back button layer */}
      <div className="px-6 pt-4 shrink-0">
        <button
          onClick={() => router.push(ROUTES.CLIENTS)}
          className="flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to clients
        </button>
      </div>

      {/* Header Profile Section */}
      <div className="px-6 flex flex-col md:flex-row md:items-start justify-between gap-6 shrink-0">
        <div className="flex items-start gap-4">
          <ClientAvatar name={client.name} size="xl" className="shadow-sm" />
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight mb-1">{client.name}</h1>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-3">
              {client.city && <span>{client.city}</span>}
              {client.city && <span className="text-muted-foreground/40 px-1">•</span>}
              {client.phone && (
                <a href={`tel:${client.phone}`} className="hover:text-primary transition-colors">{client.phone}</a>
              )}
              {client.email && client.phone && (
                <span className="text-muted-foreground/40 px-1">•</span>
              )}
              {client.email && (
                <a href={`mailto:${client.email}`} className="hover:text-primary transition-colors">{client.email}</a>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {client.tags?.map((tag: string, i: number) => (
                <span key={i} className="px-1.5 py-0.5 rounded-sm bg-muted border border-border/40 text-[9px] font-mono tracking-widest uppercase text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Action Row */}
          {whatsappLink ? (
            <Button variant="outline" className="text-[11px] font-mono tracking-widest uppercase h-9 rounded-sm" asChild>
              <a href={whatsappLink} target="_blank" rel="noreferrer">
                <MessageCircle className="w-3.5 h-3.5 mr-2" />
                WhatsApp
              </a>
            </Button>
          ) : (
            <Button variant="outline" className="text-[11px] font-mono tracking-widest uppercase h-9 rounded-sm text-muted-foreground/40 cursor-default" disabled>
              <MessageCircle className="w-3.5 h-3.5 mr-2" />
              No WhatsApp
            </Button>
          )}

          <EditClientSheet client={client}>
            <Button variant="ghost" className="text-[11px] font-mono tracking-widest uppercase h-9 rounded-sm">Edit</Button>
          </EditClientSheet>

          <Button className="text-[11px] font-mono tracking-widest uppercase h-9 rounded-sm">
            <Plus className="w-3.5 h-3.5 mr-2" />
            New Booking
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2 h-9 rounded-sm">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>Add tag</DropdownMenuItem>
              <DropdownMenuItem>Request review</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Delete client</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="px-6 mt-6 shrink-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-md bg-muted/5 border border-border/60">
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Total Bookings</span>
            <span className="font-mono text-sm tracking-widest uppercase text-foreground">{client.bookingsCount || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Total Spend</span>
            <span className="font-mono text-sm tracking-widest uppercase text-foreground">{formatAmount(client.totalSpend)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Avg Booking Value</span>
            <span className="font-mono text-sm tracking-widest uppercase text-foreground">
              {formatAmount((client.totalSpend || 0) / Math.max(1, client.bookingsCount || 1))}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground mb-1">Last Booking Date</span>
            <span className="font-mono text-sm tracking-widest uppercase text-muted-foreground">{client.lastBookingDate || "Never"}</span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="px-6 mt-6 border-b border-border/40 shrink-0 relative">
        <div className="flex sm:space-x-4 overflow-x-auto custom-scrollbar snap-x snap-mandatory">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`pb-3 pt-1 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2 snap-start
                ${currentTab === tab.id
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {/* Right fade indicator for overflow */}
        <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-background to-transparent pointer-events-none hidden sm:block" />
      </div>

      {/* Tab Render Container */}
      <div className="flex-1 overflow-auto custom-scrollbar p-6 bg-muted/5">
        {currentTab === "overview" && <ClientOverview client={client} />}
        {currentTab === "bookings" && <ClientBookings client={client} />}
        {currentTab === "finance" && <ClientFinance client={client} />}
        {currentTab === "communication" && <ClientCommunication client={client} />}
        {currentTab === "documents" && <ClientDocuments client={client} />}
      </div>

    </div>
  )
}
