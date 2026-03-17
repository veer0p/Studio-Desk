"use client";

import { 
  Bell, 
  CheckCheck, 
  Settings, 
  Filter, 
  Search, 
  Trash2,
  BellOff,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { NotificationItem } from "@/components/notifications/NotificationItem";
import { useState } from "react";
import { toast } from "sonner";

const mockNotifications = [
  { id: "n1", title: "New Inquiry Received", message: "Priya Sharma sent a new inquiry for Wedding Photography.", type: "lead", time: "2 mins ago", read: false },
  { id: "n2", title: "Contract Signed", message: "The contract for 'Aditya Rao' has been signed and is now active.", type: "contract", time: "1 hour ago", read: false },
  { id: "n3", title: "Payment Successful", message: "Payment of ₹1,24,500 received from Siddharth Malhotra.", type: "payment", time: "5 hours ago", read: true },
  { id: "n4", title: "Shoot Reminder", message: "Reminder: Wedding shoot for 'Ananya Roy' starts tomorrow at 10 AM.", type: "booking", time: "1 day ago", read: true },
  { id: "n5", title: "Team Assignment", message: "You have been assigned to 'Pre-wedding Shoot - Vikram Singh'.", type: "team", time: "2 days ago", read: true },
  { id: "n6", title: "Automation Failed", message: "WhatsApp message for 'Neha Gupta' failed to deliver.", type: "system", time: "3 days ago", read: true, error: true },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);

  const markAllRead = () => {
    setNotifications(notifications.map(n => ({ ...n, read: true })));
    toast.success("All notifications marked as read");
  };

  const clearAll = () => {
    setNotifications([]);
    toast.success("Notification center cleared");
  };

  const deleteNotification = (id: string) => {
    setNotifications(notifications.filter(n => n.id !== id));
  };

  const markRead = (id: string) => {
    setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
           <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary shadow-inner">
              <Bell className="w-6 h-6" />
           </div>
           <div>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900">Notifications</h1>
              <p className="text-sm text-muted-foreground mt-0.5 font-medium">Stay updated with your studio activities.</p>
           </div>
        </div>

        <div className="flex gap-3">
           <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-200 shadow-sm" onClick={markAllRead}>
              <CheckCheck className="w-4 h-4 mr-2" /> Mark All Read
           </Button>
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 <Button variant="ghost" size="icon" className="h-11 w-11 rounded-xl bg-white shadow-sm border border-slate-100">
                    <MoreVertical className="w-5 h-5 text-slate-400" />
                 </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="rounded-xl font-bold border-slate-100 shadow-xl">
                 <DropdownMenuItem className="text-slate-600">
                    <Settings className="w-4 h-4 mr-2" /> Notification Settings
                 </DropdownMenuItem>
                 <DropdownMenuItem className="text-rose-600 focus:text-rose-600 focus:bg-rose-50" onClick={clearAll}>
                    <Trash2 className="w-4 h-4 mr-2" /> Clear All
                 </DropdownMenuItem>
              </DropdownMenuContent>
           </DropdownMenu>
        </div>
      </div>

      <div className="flex items-center gap-4">
         <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search notifications..." className="pl-12 h-12 border-slate-100 rounded-2xl bg-white shadow-sm" />
         </div>
         <Button variant="outline" className="h-12 px-6 rounded-2xl border-slate-100 font-bold bg-white shadow-sm">
            <Filter className="w-4 h-4 mr-2" /> Filter
         </Button>
      </div>

      <div className="space-y-4">
         {notifications.length > 0 ? (
           notifications.map((n) => (
             <NotificationItem 
               key={n.id} 
               notification={n} 
               onDelete={() => deleteNotification(n.id)}
               onMarkRead={() => markRead(n.id)}
             />
           ))
         ) : (
           <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                 <BellOff className="w-10 h-10" />
              </div>
              <div className="space-y-1">
                 <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest">Inbox Zero</h3>
                 <p className="text-sm text-slate-400 font-medium">All caught up! No recent notifications.</p>
              </div>
           </div>
         )}
      </div>
    </div>
  );
}
