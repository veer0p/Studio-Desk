"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreateProposalDialog } from "@/components/proposals/CreateProposalDialog"

export function ProposalsShell({ children }: { children: React.ReactNode }) {
  const [searchQuery, setSearchQuery] = useState("")

  return (
    <div className="w-full h-full flex flex-col">
      <div className="sticky top-0 z-30 border-b border-border/40 bg-background/95 backdrop-blur shrink-0 px-6 py-6 md:px-8 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight uppercase font-mono">Proposals</h1>
          <p className="text-[10px] font-mono font-bold tracking-widest uppercase text-muted-foreground mt-2">Quotes • Drafts • Sent Proposals</p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search proposals..."
              className="pl-9 h-9 rounded-sm font-mono text-xs tracking-wider"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <CreateProposalDialog>
            <Button size="sm" className="h-9 rounded-sm bg-foreground text-background hover:bg-foreground/90 text-[10px] font-mono font-bold tracking-widest uppercase px-6 shrink-0 shadow-sm">
              <Plus className="w-3.5 h-3.5 mr-2" />
              Create Proposal
            </Button>
          </CreateProposalDialog>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative bg-muted/5">
        {children}
      </div>
    </div>
  )
}
