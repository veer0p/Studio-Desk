"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultAnnouncements,
} from "@dnd-kit/core";

import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus } from "lucide-react";

import { useLeads } from "@/hooks/use-leads";
import { LeadCard } from "./LeadCard";
import { StatusBadge } from "./StatusBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { id: "new_lead", title: "New Lead" },
  { id: "contacted", title: "Contacted" },
  { id: "proposal_sent", title: "Proposal Sent" },
  { id: "contract_signed", title: "Contract Signed" },
  { id: "advance_paid", title: "Advance Paid" },
  { id: "shoot_scheduled", title: "Shoot Scheduled" },
];

export function LeadKanban({ initialLeads = [], onLeadClick }: { initialLeads?: any[], onLeadClick?: (lead: any) => void }) {
  const { leads, updateLeadStatus } = useLeads(initialLeads);
  const [activeLead, setActiveLead] = useState<any | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const columnsLeads = useMemo(() => {
    return COLUMNS.reduce((acc, col) => {
      acc[col.id] = leads.filter((lead) => lead.status === col.id);
      return acc;
    }, {} as Record<string, any[]>);
  }, [leads]);

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const lead = leads.find((l) => l.id === active.id);
    setActiveLead(lead);
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const leadId = active.id as string;
    const overId = over.id as string;

    // Check if dropped over a column or another card
    const activeLeadItem = leads.find((l) => l.id === leadId);
    if (!activeLeadItem) return;

    let newStatus = overId;
    if (!COLUMNS.find(c => c.id === overId)) {
        // Dropped over a card, get its status
        const overLead = leads.find(l => l.id === overId);
        if (overLead) newStatus = overLead.status;
        else return;
    }

    if (activeLeadItem.status !== newStatus) {
      await updateLeadStatus(leadId, newStatus);
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-6 pb-4 overflow-x-auto min-h-[calc(100vh-250px)] snap-x snap-mandatory scrollbar-hide">
        {COLUMNS.map((column) => (
          <div key={column.id} className="flex flex-col w-80 shrink-0 snap-center first:ml-4 last:mr-4 md:first:ml-0 md:last:mr-0">
            <div className="flex items-center justify-between mb-4 px-1">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm text-slate-700 capitalize">
                  {column.title.replace(/_/g, " ")}
                </h3>
                <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {columnsLeads[column.id]?.length || 0}
                </span>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-primary active:scale-95 transition-transform">
                <Plus className="w-4 h-4" />
              </Button>
            </div>

            <ScrollArea className="flex-1 bg-slate-50/50 rounded-2xl p-2 border border-slate-100/50 shadow-inner">
              <SortableContext
                id={column.id}
                items={columnsLeads[column.id]?.map((l) => l.id) || []}
                strategy={verticalListSortingStrategy}
              >
                <div className="space-y-3 min-h-[150px] pb-20 md:pb-0">
                  {columnsLeads[column.id]?.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onClick={onLeadClick} />
                  ))}
                  {columnsLeads[column.id]?.length === 0 && (
                    <div className="h-32 flex flex-col items-center justify-center border-2 border-dashed border-slate-200/60 rounded-2xl text-slate-300 text-xs font-medium italic gap-2">
                      <div className="w-8 h-8 rounded-full bg-slate-100/50 flex items-center justify-center">
                        <Plus className="w-4 h-4 text-slate-200" />
                      </div>
                      No leads here
                    </div>
                  )}
                </div>
              </SortableContext>
            </ScrollArea>
          </div>
        ))}
      </div>


      <DragOverlay>
        {activeLead ? <LeadCard lead={activeLead} isDragging /> : null}
      </DragOverlay>
    </DndContext>
  );
}
