"use client";

import { useState } from "react";
import { 
  Plus, 
  KanbanSquare, 
  List, 
  Filter, 
  LayoutGrid,
  TrendingUp,
  Target,
  Zap
} from "lucide-react";
import { useQueryState, parseAsBoolean, parseAsStringLiteral } from "nuqs";

import { Button } from "@/components/ui/button";
import { LeadKanban } from "@/components/leads/LeadKanban";
import { LeadListView } from "@/components/leads/LeadListView";
import { FilterPanel } from "@/components/leads/FilterPanel";
import { AddLeadDrawer } from "@/components/leads/AddLeadDrawer";
import { LeadDetailDrawer } from "@/components/leads/LeadDetailDrawer";
import { BulkActionsBar } from "@/components/leads/BulkActionsBar";
import { useCurrentStudio } from "@/hooks/use-current-studio";
import Link from "next/link";
import { FileEdit } from "lucide-react";

const viewOptions = ["kanban", "list"] as const;

export default function LeadsPage({ leads: initialLeads = [] }: { leads?: any[] }) {
  const [view, setView] = useQueryState("view", parseAsStringLiteral(viewOptions).withDefault("kanban"));
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any | null>(null);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);

  // Stats (placeholder logic, would come from props or API in real app)
  const stats = [
    { label: "Total this month", value: "24", icon: LayoutGrid },
    { label: "Converted", value: "8", icon: Target },
    { label: "Conversion Rate", value: "33%", icon: TrendingUp },
  ];

  return (
    <div className="space-y-8">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <div className="flex items-center gap-6 mt-2">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-2">
                <stat.icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{stat.label}:</span>
                <span className="text-sm font-bold text-slate-900">{stat.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center p-1 bg-slate-100 rounded-lg mr-2">
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                view === "kanban" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"
              )}
              title="Kanban View"
            >
              <KanbanSquare className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "p-1.5 rounded-md transition-all",
                view === "list" ? "bg-white shadow-sm text-primary" : "text-slate-400 hover:text-slate-600"
              )}
              title="List View"
            >
              <List className="w-4 h-4" />
            </button>
          </div>

          <Button variant="outline" size="sm" onClick={() => setIsFilterOpen(true)}>
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          
          <Button variant="outline" size="sm" asChild>
            <Link href="/leads/inquiry-form">
              <FileEdit className="w-4 h-4 mr-2" /> Form Builder
            </Link>
          </Button>

          <Button size="sm" onClick={() => setIsAddOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Add Lead
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-8">
        {view === "kanban" ? (
          <LeadKanban 
            initialLeads={initialLeads} 
            onLeadClick={(lead) => setSelectedLead(lead)} 
          />
        ) : (
          <LeadListView 
            initialLeads={initialLeads} 
            onLeadClick={(lead) => setSelectedLead(lead)}
            selectedIds={selectedLeadIds}
            onSelectionChange={setSelectedLeadIds}
          />
        )}
      </div>

      <FilterPanel open={isFilterOpen} onOpenChange={setIsFilterOpen} />
      <AddLeadDrawer open={isAddOpen} onOpenChange={setIsAddOpen} />
      
      <LeadDetailDrawer 
        lead={selectedLead} 
        open={!!selectedLead} 
        onOpenChange={(open) => !open && setSelectedLead(null)} 
      />

      <BulkActionsBar 
        selectedCount={selectedLeadIds.length} 
        onClear={() => setSelectedLeadIds([])} 
      />
    </div>
  );
}

// Helper for classNames because I am in a server component context or similar
function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(" ");
}
