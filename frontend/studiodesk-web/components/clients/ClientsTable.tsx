"use client"

import { useState } from "react"
import useSWR from "swr"
import { fetchClientsList } from "@/lib/api"
import { useSearchParams, useRouter } from "next/navigation"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ArrowUpDown, Phone as PhoneIcon } from "lucide-react"
import { ClientAvatar } from "@/components/clients/shared/ClientAvatar"

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

export default function ClientsTable() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()
  const { data, isLoading } = useSWR(`/api/v1/clients?${queryString}`, fetchClientsList, { dedupingInterval: 60000 })

  const [sorting, setSorting] = useState<SortingState>([])

  const columns = [
    {
      accessorKey: "name",
      header: ({ column }: any) => {
        return (
          <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Client
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: any) => (
        <div className="flex items-center gap-3">
          <ClientAvatar name={row.original.name || "Unknown"} size="sm" />
          <div className="flex flex-col">
            <span className="font-medium text-sm text-foreground">{row.original.name}</span>
            <span className="text-xs text-muted-foreground">{row.original.city || "Unknown City"}</span>
          </div>
        </div>
      )
    },
    {
      accessorKey: "phone",
      header: "Phone",
      cell: ({ row }: any) => (
        <a 
          href={`tel:${row.original.phone}`} 
          className="flex items-center gap-2 hover:text-primary transition-colors text-sm"
          onClick={(e) => e.stopPropagation()}
        >
          <PhoneIcon className="w-3 h-3 text-muted-foreground" />
          {row.original.phone || "No phone"}
        </a>
      )
    },
    {
      accessorKey: "tags",
      header: "Tags",
      cell: ({ row }: any) => {
        const tags = row.original.tags || []
        if (tags.length === 0) return <span className="text-[10px] font-mono tracking-widest uppercase text-muted-foreground">-</span>
        
        return (
          <div className="flex items-center gap-1.5 flex-wrap max-w-[180px]">
            {tags.slice(0, 2).map((tag: string, i: number) => (
              <span key={i} className="px-1.5 py-0.5 rounded-sm bg-muted border border-border/40 text-[9px] font-mono tracking-widest uppercase text-muted-foreground whitespace-nowrap">
                {tag}
              </span>
            ))}
            {tags.length > 2 && (
              <span className="text-[9px] text-muted-foreground font-mono tracking-widest uppercase">+{tags.length - 2}</span>
            )}
          </div>
        )
      }
    },
    {
      accessorKey: "bookingsCount",
      header: ({ column }: any) => {
        return (
          <Button variant="ghost" className="-ml-4 h-8" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
            Bookings
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }: any) => (
        <span className="text-[11px] font-mono tracking-widest uppercase">{row.original.bookingsCount || 0}</span>
      )
    },
    {
      accessorKey: "totalSpend",
      header: ({ column }: any) => {
        return (
          <div className="text-right">
            <Button variant="ghost" className="h-8 pr-0 justify-end w-full" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Total Spend
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }: any) => (
        <div className="text-right font-mono text-[11px] tracking-widest uppercase font-medium mt-0.5">{formatAmount(row.original.totalSpend)}</div>
      )
    },
    {
      accessorKey: "lastBookingDate",
      header: ({ column }: any) => {
        return (
          <div className="text-right">
            <Button variant="ghost" className="h-8 pr-0 justify-end w-full" onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}>
              Last Seen
              <ArrowUpDown className="ml-2 h-4 w-4" />
            </Button>
          </div>
        )
      },
      cell: ({ row }: any) => (
        <div className="text-right text-[11px] font-mono tracking-widest uppercase text-muted-foreground mt-0.5">{row.original.lastBookingDate || "Never"}</div>
      )
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
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); router.push(`/clients/${row.original.id}`) }}>
                  View profile
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  New booking
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Send WhatsApp
                </DropdownMenuItem>
                <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                  Add tag
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600" onClick={(e) => e.stopPropagation()}>
                  Delete
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

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1,2,3,4,5,6].map(i => (
          <Skeleton key={i} className="w-full h-14 rounded-lg" />
        ))}
      </div>
    )
  }

  return (
    <div className="w-full flex-1 flex flex-col bg-card h-full">
      <div className="flex-1 overflow-auto custom-scrollbar relative">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/50 sticky top-0 z-10 hidden sm:table-header-group">
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
                className="border-b border-border/40 hover:bg-muted/30 transition-colors cursor-pointer block sm:table-row"
                onClick={() => router.push(`/clients/${row.original.id}`)}
              >
                {row.getVisibleCells().map((cell, i) => (
                  <td key={cell.id} className={`px-4 py-3 align-middle ${i !== 0 ? 'hidden sm:table-cell' : 'block w-full'}`}>
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
      </div>

      <div className="flex items-center justify-between p-4 border-t border-border/40 shrink-0 bg-background/50 backdrop-blur">
        <div className="text-xs text-muted-foreground hidden sm:block">
          Showing {table.getRowModel().rows.length} of {data?.list?.length || 0} clients
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
