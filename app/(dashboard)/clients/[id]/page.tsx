"use client";

import { useState } from "react";
import { 
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  FileText,
  MoreHorizontal,
  Edit,
  History,
  TrendingUp,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  
  // Mock data for a single client
  const client = {
    id: params.id,
    full_name: "John Doe",
    email: "john@example.com",
    phone: "+91 98765 43210",
    address: "123 Photography Lane, Mumbai, Maharashtra 400001",
    type: "regular",
    created_at: "2023-08-12",
    total_bookings: 3,
    total_spent: 45000,
    gstin: null,
    bookings: [
      { id: "B1", shoot_name: "Summer Wedding", shoot_date: "2024-02-15", status: "delivered", total_amount: 25000 },
      { id: "B2", shoot_name: "Family Portrait", shoot_date: "2023-11-10", status: "delivered", total_amount: 10000 },
      { id: "B3", shoot_name: "Engagement", shoot_date: "2023-09-05", status: "delivered", total_amount: 10000 },
    ],
    interactions: [
      { id: 1, type: "call", note: "Discussed wedding packages", date: "2024-01-20" },
      { id: 2, type: "email", note: "Sent contract for Summer Wedding", date: "2024-01-15" },
    ]
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" className="rounded-full" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{client.full_name}</h1>
              <Badge variant="outline" className="text-[10px] uppercase font-bold tracking-wider border-slate-200 text-slate-600 bg-slate-50">
                {client.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground mt-1">Client since {format(new Date(client.created_at), "MMMM yyyy")}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
           <Button variant="outline" size="sm">
             <MessageCircle className="w-4 h-4 mr-2 text-emerald-600" /> WhatsApp
           </Button>
           <Button size="sm">
             <Edit className="w-4 h-4 mr-2" /> Edit Profile
           </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Client Info & Stats */}
        <div className="lg:col-span-1 space-y-6">
           <Card className="border-slate-200 shadow-sm overflow-hidden">
             <CardHeader className="bg-slate-50/50 pb-4">
               <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Contact Details</CardTitle>
             </CardHeader>
             <CardContent className="pt-6 space-y-6">
               <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                   <Mail className="w-4 h-4" />
                 </div>
                 <div className="flex-1 overflow-hidden">
                   <div className="text-[10px] text-slate-400 font-bold uppercase">Email</div>
                   <div className="text-sm font-medium truncate">{client.email}</div>
                 </div>
                 <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                   <ExternalLink className="w-4 h-4" />
                 </Button>
               </div>

               <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                   <Phone className="w-4 h-4" />
                 </div>
                 <div className="flex-1 overflow-hidden">
                   <div className="text-[10px] text-slate-400 font-bold uppercase">Phone</div>
                   <div className="text-sm font-medium truncate">{client.phone}</div>
                 </div>
               </div>

               <div className="flex items-center gap-3">
                 <div className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                   <MapPin className="w-4 h-4" />
                 </div>
                 <div className="flex-1 overflow-hidden">
                   <div className="text-[10px] text-slate-400 font-bold uppercase">Address</div>
                   <div className="text-sm font-medium leading-tight">{client.address}</div>
                 </div>
               </div>

               {client.gstin && (
                 <div className="flex items-center gap-3 pt-2">
                   <Badge variant="secondary" className="bg-slate-100 text-slate-600 font-bold">
                     GSTIN: {client.gstin}
                   </Badge>
                 </div>
               )}
             </CardContent>
           </Card>

           <div className="grid grid-cols-2 gap-4">
              <Card className="border-slate-200 shadow-sm">
                <CardContent className="pt-6 pb-6 text-center">
                   <div className="text-3xl font-bold text-slate-900">{client.total_bookings}</div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Bookings</div>
                </CardContent>
              </Card>
              <Card className="border-slate-200 shadow-sm border-b-4 border-b-teal-500">
                <CardContent className="pt-6 pb-6 text-center">
                   <div className="text-2xl font-bold text-teal-600">₹{(client.total_spent / 1000).toFixed(1)}k</div>
                   <div className="text-[10px] font-bold text-slate-400 uppercase mt-1">Revenue</div>
                </CardContent>
              </Card>
           </div>
        </div>

        {/* Right Column: Bookings & Activity */}
        <div className="lg:col-span-2 space-y-6">
           <Tabs defaultValue="bookings" className="w-full">
              <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 gap-8">
                <TabsTrigger value="bookings" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-bold text-xs uppercase tracking-wider">
                  Booking History
                </TabsTrigger>
                <TabsTrigger value="notes" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-bold text-xs uppercase tracking-wider">
                  Interaction Log
                </TabsTrigger>
                <TabsTrigger value="docs" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-0 pb-3 font-bold text-xs uppercase tracking-wider">
                  Documents
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="bookings" className="pt-6">
                 <div className="space-y-4">
                    {client.bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 bg-white border border-slate-200 rounded-xl hover:border-primary transition-all group cursor-pointer">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                            <Calendar className="w-5 h-5" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900 group-hover:text-primary transition-colors">{booking.shoot_name}</div>
                            <div className="text-[10px] text-slate-400 font-medium">
                              {format(new Date(booking.shoot_date), "MMMM d, yyyy")} • ID: {booking.id}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-6">
                           <div className="text-right">
                              <div className="text-sm font-bold text-slate-700">₹{booking.total_amount.toLocaleString()}</div>
                              <div className="text-[10px] text-teal-600 font-bold uppercase">{booking.status}</div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-primary transition-all group-hover:translate-x-1" />
                        </div>
                      </div>
                    ))}
                    
                    <Button variant="outline" className="w-full border-dashed border-2 py-8 h-auto text-slate-400">
                      <Plus className="w-4 h-4 mr-2" /> New Booking for {client.full_name}
                    </Button>
                 </div>
              </TabsContent>

              <TabsContent value="notes" className="pt-6">
                 <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 before:to-transparent">
                   {client.interactions.map((interaction) => (
                     <div key={interaction.id} className="relative flex items-start gap-6">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 border-2 border-white shadow-sm ring-1 ring-slate-200">
                           {interaction.type === 'call' ? <Phone className="h-4 w-4 text-primary" /> : <Mail className="h-4 w-4 text-accent" />}
                        </div>
                        <div className="flex-1 bg-white p-4 rounded-xl border border-slate-200 shadow-sm mt-1">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold uppercase tracking-wider text-slate-900">{interaction.type}</span>
                              <span className="text-[10px] text-slate-400">{format(new Date(interaction.date), "MMM d, yyyy")}</span>
                           </div>
                           <p className="text-sm text-slate-600">{interaction.note}</p>
                        </div>
                     </div>
                   ))}
                 </div>
              </TabsContent>

              <TabsContent value="docs" className="pt-6">
                 <div className="grid grid-cols-2 gap-4">
                    <Card className="border-slate-200 border-dashed hover:border-primary transition-all cursor-pointer">
                       <CardContent className="p-4 flex flex-col items-center justify-center text-center space-y-2">
                          <FileText className="w-6 h-6 text-slate-300" />
                          <div className="text-xs font-bold text-slate-700">Client Contract</div>
                          <div className="text-[10px] text-slate-400">PDF • 1.2 MB</div>
                       </CardContent>
                    </Card>
                 </div>
              </TabsContent>
           </Tabs>
        </div>
      </div>
    </div>
  );
}
