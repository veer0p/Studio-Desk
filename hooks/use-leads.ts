"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Database } from "@/types/database";

type Lead = Database["public"]["Tables"]["leads"]["Row"] & {
  client?: Database["public"]["Tables"]["clients"]["Row"];
};

export type LeadStatus = Database["public"]["Enums"]["lead_status"] | string;

/**
 * Hook for managing leads with optimistic updates.
 */
export function useLeads(initialLeads: Lead[]) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [isUpdating, setIsUpdating] = useState(false);
  const router = useRouter();

  const updateLeadStatus = useCallback(async (id: string, newStatus: string) => {
    const previousLeads = [...leads];
    
    // Apply optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, status: newStatus } : l));
    
    setIsUpdating(true);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");
      
      toast.success("Lead status updated");
      router.refresh();
    } catch (error) {
      setLeads(previousLeads);
      toast.error("Could not update lead status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  }, [leads, router]);

  const deleteLead = useCallback(async (id: string) => {
    const previousLeads = [...leads];
    setLeads(prev => prev.filter(l => l.id !== id));
    
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete lead");
      
      toast.success("Lead deleted");
      router.refresh();
    } catch (error) {
      setLeads(previousLeads);
      toast.error("Could not delete lead");
    }
  }, [leads, router]);

  const addLead = useCallback((newLead: Lead) => {
    setLeads(prev => [newLead, ...prev]);
  }, []);

  return {
    leads,
    setLeads,
    updateLeadStatus,
    deleteLead,
    addLead,
    isUpdating,
  };
}
