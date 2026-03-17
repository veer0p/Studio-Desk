"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { StatusBadge } from "./StatusBadge";
import { format } from "date-fns";
import { MoreHorizontal, Mail, Phone, MessageCircle, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface LeadListViewProps {
  initialLeads?: any[];
  onLeadClick?: (lead: any) => void;
  selectedIds?: string[];
  onSelectionChange?: (ids: string[]) => void;
}

export function LeadListView({ 
  initialLeads = [], 
  onLeadClick,
  selectedIds = [],
  onSelectionChange 
}: LeadListViewProps) {
  const toggleAll = () => {
    if (selectedIds.length === initialLeads.length) {
      onSelectionChange?.([]);
    } else {
      onSelectionChange?.(initialLeads.map(l => l.id));
    }
  };

  const toggleOne = (id: string) => {
    if (selectedIds.includes(id)) {
      onSelectionChange?.(selectedIds.filter(i => i !== id));
    } else {
      onSelectionChange?.([...selectedIds, id]);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      <Table>
        <TableHeader className="bg-slate-50">
          <TableRow>
            <TableHead className="w-[40px]">
              <Checkbox 
                checked={initialLeads.length > 0 && selectedIds.length === initialLeads.length}
                onCheckedChange={toggleAll}
              />
            </TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Event Type</TableHead>
            <TableHead>Event Date</TableHead>
            <TableHead>Budget</TableHead>
            <TableHead>Source</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {initialLeads.map((lead) => (
            <TableRow 
              key={lead.id} 
              className={cn(
                "hover:bg-slate-50/50 cursor-pointer group",
                selectedIds.includes(lead.id) && "bg-slate-50"
              )}
              onClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.closest('button') || target.closest('[role="checkbox"]')) return;
                onLeadClick?.(lead);
              }}
            >
              <TableCell>
                <Checkbox 
                  checked={selectedIds.includes(lead.id)} 
                  onCheckedChange={() => toggleOne(lead.id)}
                />
              </TableCell>
              <TableCell className="font-bold text-slate-900">
                {lead.client_name || lead.client?.full_name || "Unknown"}
              </TableCell>
              <TableCell>
                <StatusBadge status={lead.status} />
              </TableCell>
              <TableCell className="text-sm text-slate-600">
                {lead.event_type}
              </TableCell>
              <TableCell className="text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-slate-400" />
                  {lead.event_date_approx ? format(new Date(lead.event_date_approx), "MMM d, yyyy") : "TBD"}
                </div>
              </TableCell>
              <TableCell className="text-sm font-medium text-slate-700">
                {lead.budget_max ? `₹${(lead.budget_max / 1000).toFixed(0)}K` : "—"}
              </TableCell>
              <TableCell>
                 <div className="flex items-center gap-1.5 text-xs text-slate-500 capitalize">
                   {lead.source === 'inquiry_form' ? <Mail className="w-3 h-3" /> : <Phone className="w-3 h-3" />}
                   {lead.source.replace('_', ' ')}
                 </div>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                    <DropdownMenuItem className="text-rose-600">Delete Lead</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
          {initialLeads.length === 0 && (
            <TableRow>
              <TableCell colSpan={8} className="h-32 text-center text-muted-foreground italic">
                No leads found matching your criteria.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
