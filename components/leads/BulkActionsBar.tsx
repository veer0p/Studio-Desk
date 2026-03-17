"use client";

import { Button } from "@/components/ui/button";
import { 
  Trash2, 
  UserCircle, 
  Send, 
  CheckCircle2, 
  XCircle,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";

interface BulkActionsBarProps {
  selectedCount: number;
  onClear: () => void;
  onDelete?: () => void;
  onAssign?: () => void;
  onUpdateStatus?: (status: string) => void;
}

export function BulkActionsBar({ 
  selectedCount, 
  onClear,
  onDelete,
  onAssign,
  onUpdateStatus
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
      <div className="bg-slate-900 text-white rounded-full px-6 py-3 shadow-2xl flex items-center gap-6 border border-slate-800">
        <div className="flex items-center gap-3 pr-6 border-r border-slate-800">
          <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-[10px] font-bold">
            {selectedCount}
          </div>
          <span className="text-sm font-medium whitespace-nowrap">leads selected</span>
          <button onClick={onClear} className="text-xs text-slate-400 hover:text-white underline">Clear</button>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="h-8 text-white hover:bg-slate-800 px-3" onClick={onAssign}>
            <UserCircle className="w-3.5 h-3.5 mr-2" /> Assign
          </Button>

          <Button variant="ghost" size="sm" className="h-8 text-white hover:bg-slate-800 px-3">
             <Send className="w-3.5 h-3.5 mr-2" /> Status
          </Button>

          <Button variant="ghost" size="sm" className="h-8 text-rose-400 hover:bg-rose-900/40 hover:text-rose-300 px-3" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
