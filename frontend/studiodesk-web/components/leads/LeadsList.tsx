"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import type { BookingSummary } from "@/lib/api"
import { fetchBookingsList, updateBookingStage } from "@/lib/api"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { EventTypeDot } from "@/components/bookings/shared/EventTypeDot"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"
import Link from "next/link"

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
  ColumnDef,
} from "@tanstack/react-table"

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

export function LeadsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const searchQuery = searchParams.get("search") || ""
  const { data, isLoading, error } = useSWR(
    `/api/v1/bookings?stage=Inquiry,Proposal%20Sent,Negotiation&search=${searchQuery}`,
    fetchBookingsList
  )
  const { mutate: mutateGlobal } = useSWRConfig()

  const handleMarkQualified = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateBookingStage(id, "Won")
      toast.success("Lead marked as Qualified")
      mutateGlobal(key => typeof key === 'string' && key.startsWith('/api/v1/bookings'))
    } catch {
      toast.error("Failed to update lead status")
    }
  }

  const [sorting, setSorting] = useState<SortingState>([])

  const columns: ColumnDef<BookingSummary>[] = [
    {
      accessorKey: "clientName",
      header: "Client",
      cell: ({ row }) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">{row.original.clientName}</span>
          <span className="text-xs text-muted-foreground">{row.original.eventType}</span>
        </div>
      )
    },
    {
      accessorKey: "date",
      header: ({ column }) => (
        <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Date
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">{row.original.date}</div>
      )
    },
    {
      accessorKey: "venue",
      header: "Venue",
      cell: ({ row }) => (
        <div className="text-sm truncate max-w-[200px]">{row.original.venue || "—"}</div>
      )
    },
    {
      accessorKey: "stage",
      header: ({ column }) => (
        <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Stage
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const stage = row.original.stage || "Inquiry"
        const stageColors: Record<string, string> = {
          "Inquiry": "bg-blue-500/10 text-blue-600 border-blue-500/20",
          "Proposal Sent": "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
          "Negotiation": "bg-orange-500/10 text-orange-600 border-orange-500/20",
        }
        const colorClass = stageColors[stage] || "bg-muted/50 text-muted-foreground border-border/40"
        return (
          <span className={`text-[9px] font-mono tracking-widest uppercase px-2 py-0.5 rounded-sm border ${colorClass}`}>
            {stage}
          </span>
        )
      }
    },
    {
      accessorKey: "amount",
      header: ({ column }) => (
        <Button variant="ghost" className="-ml-4 h-8 pr-0 justify-end w-full" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
          Amount
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-right font-mono text-[11px] uppercase tracking-widest">{formatAmount(row.original.amount)}</div>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => {
        return (
          <div className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0" onClick={(e) => e.stopPropagation()}>
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/leads/${row.original.id}`}>View details</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleMarkQualified(row.original.id as string, e)}>
                  Mark qualified
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                  Convert to booking
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ]

  const table = useReactTable<BookingSummary>({
    data: data?.list || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 25,
      },
    },
  })

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <Skeleton key={i} className="w-full h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4 p-8">
        <p className="text-muted-foreground">Failed to load leads</p>
        <button onClick={() => mutateGlobal(key => typeof key === 'string' && key.startsWith('/api/v1/bookings'))} className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90">
          Retry
        </button>
      </div>
    )
  }

  const totalLeads = data?.count ?? data?.list?.length ?? 0

  return (
    <div className="w-full flex flex-col bg-card h-full">
      <div className="flex-1 overflow-auto custom-scrollbar relative px-2 sm:px-0">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th key={header.id} className="px-4 py-3 font-medium whitespace-nowrap">
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                className="border-b border-border/40 hover:bg-muted/40 transition-colors cursor-pointer"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 align-middle">
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        {table.getRowModel().rows.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-center text-muted-foreground">
            <p className="font-medium text-foreground mb-1">No leads found</p>
            <p className="text-sm">Try adjusting your search or filters.</p>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border/40 mt-auto shrink-0 bg-background/50 backdrop-blur">
        <div className="text-xs text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {totalLeads} leads
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}
