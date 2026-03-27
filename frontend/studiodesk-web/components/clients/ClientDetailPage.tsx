"use client"

import { Skeleton } from "@/components/ui/skeleton"

import { useState } from "react"
import useSWR from "swr"
import { fetcher } from "@/lib/api"
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

  const { data: client, isLoading } = useSWR(`/api/v1/clients/${clientId}`, fetcher, { dedupingInterval: 10000 })

  const setTab = (tab: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("tab", tab)
    router.replace(`/clients/${clientId}?${params.toString()}`)
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-8">
        <Skeleton className="w-full h-32 rounded-xl" />
        <Skeleton className="w-full h-[400px] rounded-xl" />
      </div>
    )
  }

  if (!client) {
    return (
      <div className="p-8 flex items-center justify-center flex-col">
        <p className="text-muted-foreground mb-4">Client not found.</p>
        <Button onClick={() => router.push("/clients")}>Back to clients</Button>
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
  const whatsappLink = `https://wa.me/${whatsappPhone.replace(/\D/g, "")}`

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      
      {/* Back button layer */}
      <div className="px-6 pt-4 shrink-0">
        <button 
          onClick={() => router.push("/clients")}
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
              {client.city && <span className="text-border px-1">•</span>}
              <a href={`tel:${client.phone}`} className="hover:text-primary transition-colors">{client.phone}</a>
              {client.email && (
                <>
                  <span className="text-border px-1">•</span>
                  <a href={`mailto:${client.email}`} className="hover:text-primary transition-colors">{client.email}</a>
                </>
              )}
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {client.tags?.map((tag: string, i: number) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-muted border border-border/40 text-[10px] font-medium text-muted-foreground">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Action Row */}
          <Button variant="ghost" className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10" asChild>
            <a href={whatsappLink} target="_blank" rel="noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" />
              WhatsApp
            </a>
          </Button>

          <EditClientSheet client={client}>
            <Button variant="ghost">Edit</Button>
          </EditClientSheet>

          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Booking
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="px-2">
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
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl bg-card border border-border/60">
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1 font-medium">Total Bookings</span>
            <span className="font-semibold text-lg">{client.bookingsCount || 0}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1 font-medium">Total Spend</span>
            <span className="font-semibold text-lg font-mono tracking-tight">{formatAmount(client.totalSpend)}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1 font-medium">Avg Booking Value</span>
            <span className="font-semibold text-lg font-mono tracking-tight">
              {formatAmount((client.totalSpend || 0) / Math.max(1, client.bookingsCount || 1))}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground mb-1 font-medium">Last Booking Date</span>
            <span className="font-semibold text-lg">{client.lastBookingDate || "Never"}</span>
          </div>
        </div>
      </div>

      {/* Tabs Layout */}
      <div className="px-6 mt-6 border-b border-border/40 shrink-0">
        <div className="flex sm:space-x-4 overflow-x-auto custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setTab(tab.id)}
              className={`pb-3 pt-1 px-2 text-sm font-medium whitespace-nowrap transition-colors border-b-2
                ${currentTab === tab.id 
                  ? "border-primary text-foreground" 
                  : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
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
