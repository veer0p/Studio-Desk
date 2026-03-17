"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle,
  SheetDescription
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  MapPin, 
  Users, 
  Wallet,
  Clock,
  ChevronRight
} from "lucide-react";

interface FilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function FilterPanel({ open, onOpenChange }: FilterPanelProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-xs">
        <SheetHeader>
          <SheetTitle>Filters</SheetTitle>
          <SheetDescription>
            Refine your leads list with custom filters.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6 py-6">
          <div className="space-y-3">
            <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Lead Source</Label>
            <div className="flex flex-wrap gap-2">
              {['Inquiry Form', 'Instagram', 'Referral', 'Walk-in'].map(s => (
                <Badge key={s} variant="outline" className="cursor-pointer hover:bg-slate-100">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Event Timeline</Label>
            <div className="space-y-2">
              <Button variant="outline" size="sm" className="w-full justify-start font-normal text-xs">
                <Calendar className="w-3.5 h-3.5 mr-2" /> Select Date Range
              </Button>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <Label className="text-xs uppercase font-bold tracking-wider text-muted-foreground">Estimated Budget</Label>
            <div className="grid grid-cols-2 gap-2">
               <div className="p-2 border rounded-lg text-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all">
                 <div className="text-[10px] text-muted-foreground">Low</div>
                 <div className="text-xs font-bold">{"<"} 50K</div>
               </div>
               <div className="p-2 border rounded-lg text-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all">
                 <div className="text-[10px] text-muted-foreground">Mid</div>
                 <div className="text-xs font-bold">50K - 1.5L</div>
               </div>
               <div className="p-2 border rounded-lg text-center cursor-pointer hover:border-primary hover:bg-slate-50 transition-all">
                 <div className="text-[10px] text-muted-foreground">High</div>
                 <div className="text-xs font-bold">1.5L+</div>
               </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 bg-white border-t">
          <div className="flex gap-2">
             <Button variant="ghost" className="flex-1" onClick={() => onOpenChange(false)}>Clear</Button>
             <Button className="flex-1" onClick={() => onOpenChange(false)}>Apply</Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
