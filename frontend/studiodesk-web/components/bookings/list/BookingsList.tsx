"use client"

import { useState } from "react"
import useSWR, { useSWRConfig } from "swr"
import { fetchBookingsList, updateBookingStage } from "@/lib/api"
import { useSearchParams, useRouter } from "next/navigation"
import { toast } from "sonner"
import { EventTypeDot } from "@/components/bookings/shared/EventTypeDot"
import { BookingStatusBadge } from "@/components/bookings/shared/BookingStatusBadge"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown } from "lucide-react"

import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  useReactTable,
  SortingState,
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

export default function BookingsList() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const { data, isLoading, error, mutate } = useSWR(`/api/v1/bookings?${queryString}`, fetchBookingsList, {
    refreshInterval: 60000
  })
  const { mutate: mutateGlobal } = useSWRConfig()

  const handleMarkConfirmed = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await updateBookingStage(id, "Confirmed")
      toast.success("Booking marked as Confirmed")
      mutateGlobal(key => typeof key === 'string' && key.startsWith('/api/v1/bookings'))
    } catch {
      toast.error("Failed to update booking status")
    }
  }

  const [sorting, setSorting] = useState<SortingState>([])

  const columns = [
    {
      accessorKey: "clientName",
      header: "Client",
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <span className="font-medium text-sm text-foreground">{row.original.clientName}</span>
          <span className="text-xs text-muted-foreground">{row.original.city || "Unknown City"}</span>
        </div>
      )
    },
    {
      accessorKey: "event",
      header: "Event",
      cell: ({ row }: any) => (
        <div className="flex items-center gap-2">
          <EventTypeDot type={row.original.eventType} />
          <span className="text-sm font-medium">{row.original.eventName || row.original.eventType}</span>
        </div>
      )
    },
    {
      accessorKey: "date",
      header: ({ column }: any) => {
        return (
          <Button variant="ghost" className="-ml-4 h-8 data-[state=open]:bg-accent" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: any) => (
        <div className="flex flex-col">
          <span className="text-sm">{row.original.date}</span>
          {row.original.daysUntil && (
            <span className="text-xs text-muted-foreground">{row.original.daysUntil}</span>
          )}
        </div>
      )
    },
    {
      accessorKey: "stage",
      header: ({ column }: any) => {
        return (
          <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Stage
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: any) => (
        <BookingStatusBadge stage={row.original.stage || "Inquiry"} />
      )
    },
    {
      accessorKey: "team",
      header: "Team",
      meta: { responsive: "hidden lg:table-cell" },
      cell: ({ row }: any) => {
        const team = row.original.team || []
        return (
          <div className="flex -space-x-2">
            {team.slice(0, 3).map((member: any, i: number) => (
              <div key={i} className="w-5 h-5 rounded-sm bg-muted border border-background flex items-center justify-center text-[9px] font-mono tracking-widest uppercase overflow-hidden shrink-0">
                {member.avatar ? (
                  <img src={member.avatar} alt="Avatar" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                ) : (
                  member.name?.charAt(0) || "U"
                )}
              </div>
            ))}
            {team.length > 3 && (
              <div className="w-5 h-5 rounded-sm bg-background border border-border/40 flex items-center justify-center text-[9px] font-mono tracking-widest uppercase text-muted-foreground z-10 shrink-0">
                +{team.length - 3}
              </div>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "amount",
      header: ({ column }: any) => {
        return (
          <div className="text-right">
            <Button variant="ghost" className="h-8 pr-0 justify-end w-full" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Amount
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }: any) => (
        <div className="text-right font-mono text-[11px] uppercase tracking-widest mt-0.5">{formatAmount(row.original.amount)}</div>
      )
    },
    {
      accessorKey: "balanceDue",
      header: () => <div className="text-right hidden lg:block">Balance Due</div>,
      meta: { responsive: "hidden lg:table-cell" },
      cell: ({ row }: any) => {
        const bal = row.original.balanceDue || 0
        return (
          <div className={`text-right font-mono text-[11px] uppercase tracking-widest mt-0.5 ${bal > 0 ? "text-foreground" : "text-muted-foreground/50"}`}>
            {formatAmount(bal)}
          </div>
        )
      }
    },
    {
      id: "actions",
      cell: ({ row }: any) => {
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
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openDetail(row.original.id as string) }}>
                  View details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => handleMarkConfirmed(row.original.id as string, e)}>
                  Mark confirmed
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-muted-foreground" onClick={(e) => e.stopPropagation()}>
                  Add payment
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )
      }
    }
  ]

  const table = useReactTable({
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

  const openDetail = (id: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("id", id)
    router.push(`/bookings?${params.toString()}`, { scroll: false })
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1,2,3,4,5,6].map(i => (
          <Skeleton key={i} className="w-full h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center w-full h-full gap-4 p-8">
        <p className="text-muted-foreground">Failed to load bookings</p>
        <button onClick={() => mutate()} className="px-4 py-2 text-sm font-medium bg-foreground text-background rounded-md hover:bg-foreground/90">
          Retry
        </button>
      </div>
    )
  }

  const totalBookings = data?.count ?? data?.list?.length ?? 0

  return (
    <div className="w-full flex flex-col bg-card h-full">
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        {table.getRowModel().rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <p className="text-lg font-medium text-foreground">No bookings found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 hidden sm:table-header-group">
                {table.getHeaderGroups().map(headerGroup => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map(header => {
                      const colDef = header.column.columnDef as any
                      const responsiveClass = colDef.meta?.responsive || ""
                      return (
                        <th key={header.id} className={`px-4 py-3 font-medium whitespace-nowrap ${responsiveClass}`}>
                          {flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map(row => (
                  <tr
                    key={row.id}
                    className="border-b border-border/40 hover:bg-muted/40 transition-colors cursor-pointer"
                    onClick={() => openDetail(row.original.id as string)}
                  >
                    {row.getVisibleCells().map(cell => {
                      const colDef = cell.column.columnDef as any
                      const responsiveClass = colDef.meta?.responsive || ""
                      return (
                        <td key={cell.id} className={`px-4 py-3 align-middle whitespace-nowrap ${responsiveClass}`}>
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border/40 mt-auto shrink-0 bg-background/50 backdrop-blur">
        <div className="text-xs text-muted-foreground">
          Showing {table.getRowModel().rows.length} of {totalBookings} bookings
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
