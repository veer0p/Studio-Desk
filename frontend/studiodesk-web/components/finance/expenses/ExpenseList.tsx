"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, Edit2, Trash2, Camera, Car, Building2, Users, Monitor, Megaphone, Printer, Coffee, HelpCircle, Paperclip } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AddExpenseDialog } from "./AddExpenseDialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const formatINR = (amt: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amt)

const getCategoryBadge = (category: string) => {
  const base = "flex items-center gap-1.5 px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold tracking-widest uppercase w-fit border bg-muted text-foreground"
  switch (category.toLowerCase()) {
    case 'equipment': return <span className={`${base} border-primary/20`}><Camera className="w-3 h-3"/> Equipment</span>
    case 'travel': return <span className={`${base} border-primary/40`}><Car className="w-3 h-3"/> Travel</span>
    case 'studio rent': return <span className={`${base} border-primary/30`}><Building2 className="w-3 h-3"/> Rent</span>
    case 'freelancer fee': return <span className={`${base} border-primary/50`}><Users className="w-3 h-3"/> Freelancer</span>
    case 'software': return <span className={`${base} border-border/60`}><Monitor className="w-3 h-3"/> Software</span>
    case 'marketing': return <span className={`${base} border-border/40`}><Megaphone className="w-3 h-3"/> Marketing</span>
    case 'printing': return <span className={`${base} border-border/30`}><Printer className="w-3 h-3"/> Printing</span>
    case 'food & misc': return <span className={`${base} border-border/20`}><Coffee className="w-3 h-3"/> Food & Misc</span>
    default: return <span className={`${base} border-border/40`}><HelpCircle className="w-3 h-3"/> Other</span>
  }
}

export function ExpenseList() {
  const [searchQuery, setSearchQuery] = useState("")

  const expenses = [
    {
      id: "exp-1",
      date: "14 Oct 2025",
      description: "Sony G-Master 24-70mm Lens rental",
      category: "equipment",
      vendor: "Lensekart Pro",
      amount: 12500,
      gstInput: 2250,
      hasReceipt: true
    },
    {
      id: "exp-2",
      date: "12 Oct 2025",
      description: "Second shooter fees (Rohan & Priya Wedding)",
      category: "freelancer fee",
      vendor: "Vikram Singh",
      amount: 25000,
      gstInput: 0,
      hasReceipt: false
    },
    {
      id: "exp-3",
      date: "08 Oct 2025",
      description: "Adobe CC Annual Subscription",
      category: "software",
      vendor: "Adobe Inc.",
      amount: 42000,
      gstInput: 7560,
      hasReceipt: true
    },
    {
      id: "exp-4",
      date: "05 Oct 2025",
      description: "Uber to Mumbai venue",
      category: "travel",
      vendor: "Uber",
      amount: 1450,
      gstInput: 0,
      hasReceipt: true
    }
  ]

  const totalExp = expenses.reduce((acc, curr) => acc + curr.amount, 0)
  const totalGst = expenses.reduce((acc, curr) => acc + curr.gstInput, 0)

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight">Expenses</h2>
          <span className="px-2 py-0.5 rounded-sm bg-muted text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-widest">{expenses.length} records</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search descriptions, vendors..." 
              className="pl-9 w-[200px] lg:w-[260px] bg-background border-border/60"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <Button variant="outline" size="sm" className="bg-background border-border/60 h-10">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>

          <AddExpenseDialog>
            <Button size="sm" className="h-10 shrink-0">
              <Plus className="w-4 h-4 mr-2" />
              Add Expense
            </Button>
          </AddExpenseDialog>
        </div>
      </div>

      <div className="flex-1 bg-card border border-border/60 rounded-md overflow-hidden shadow-sm flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-muted/50 border-b border-border/40 text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
              <tr>
                <th className="px-4 py-3 min-w-[110px]">Date</th>
                <th className="px-4 py-3 min-w-[200px]">Description</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Vendor</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3 text-right">GST Input</th>
                <th className="px-4 py-3 text-center">Receipt</th>
                <th className="px-4 py-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-[11px] font-mono tracking-widest uppercase text-foreground whitespace-nowrap">{exp.date}</td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{exp.description}</td>
                  <td className="px-4 py-3">{getCategoryBadge(exp.category)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{exp.vendor || "—"}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[11px] font-mono tracking-widest uppercase font-semibold text-foreground">
                      {formatINR(exp.amount)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[11px] font-mono tracking-widest uppercase text-muted-foreground">
                      {exp.gstInput > 0 ? formatINR(exp.gstInput) : "—"}
                    </span>
                  </td>                  <td className="px-4 py-3 text-center">
                    {exp.hasReceipt ? (
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full bg-muted/50 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10">
                        <Paperclip className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <span className="text-muted-foreground/30">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit2 className="mr-2 h-4 w-4" /> Edit expense
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="shrink-0 flex items-center justify-between p-4 bg-muted border border-border/60 rounded-md text-foreground">
        <div className="flex flex-col">
          <span className="text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-widest mb-1">Total Expenses</span>
          <span className="font-mono font-bold text-lg tracking-widest uppercase">{formatINR(totalExp)}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-muted-foreground font-mono font-bold uppercase tracking-widest mb-1">Total GST Input Credit</span>
          <span className="font-mono font-bold text-foreground tracking-widest uppercase">{formatINR(totalGst)}</span>
        </div>
      </div>

    </div>
  )
}
