"use client";

import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetFooter
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { Loader2, Send } from "lucide-react";

interface RequestChangesSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  token: string;
}

export function RequestChangesSheet({ open, onOpenChange, onSuccess, token }: RequestChangesSheetProps) {
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      onSuccess();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[400px] sm:h-full sm:w-[500px] sm:side-right">
        <SheetHeader className="pb-8">
          <SheetTitle className="text-xl font-bold">Request Changes</SheetTitle>
          <SheetDescription>
            Let us know what you'd like to adjust in this proposal. We'll get back to you with a revised version as soon as possible.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
             <Label htmlFor="changes" className="font-bold text-slate-900">Your Feedback</Label>
             <Textarea 
                id="changes"
                placeholder="e.g., We'd like to add another photographer, or adjust the coverage hours..."
                className="min-h-[150px] bg-slate-50 border-slate-100 focus:bg-white resize-none"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
             />
          </div>
        </div>

        <SheetFooter className="mt-8">
          <Button 
            className="w-full h-12 bg-slate-900 shadow-xl" 
            disabled={!message.trim() || isSubmitting}
            onClick={handleSubmit}
          >
            {isSubmitting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Submitting...</>
            ) : (
              <><Send className="w-4 h-4 mr-2" /> Send Request</>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
