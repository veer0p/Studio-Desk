import { 
  Users, 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  AlertCircle,
  Search,
  Filter,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatIndianDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import Link from "next/link";

async function getAssignments() {
  // Mock data
  return [
    { 
      id: "AS-1", 
      booking_id: "B-1",
      booking_title: "Sharma Wedding",
      client_name: "Priya Sharma",
      member_name: "Viraj Patel",
      role: "Lead Photographer",
      event_date: "2025-03-15",
      call_time: "10:00 AM",
      is_confirmed: true
    },
    { 
      id: "AS-2", 
      booking_id: "B-2",
      booking_title: "Corporate: Google DevFest",
      client_name: "Amit Patel",
      member_name: "Sneha Rao",
      role: "2nd Shooter",
      event_date: "2025-03-20",
      call_time: "09:00 AM",
      is_confirmed: false
    },
    { 
      id: "AS-3", 
      booking_id: "B-3",
      booking_title: "Birthday: Aisha Turn 1",
      client_name: "Neha Gupta",
      member_name: "Rahul Mehra",
      role: "Lead Videographer",
      event_date: "2025-03-22",
      call_time: "04:00 PM",
      is_confirmed: true
    }
  ];
}

export default async function AssignmentsPage() {
  const assignments = await getAssignments();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Assignments</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-sm text-muted-foreground font-medium">Tracking all team member shoot commitments.</span>
             <Badge variant="secondary" className="bg-amber-100 text-amber-700 h-5 text-[10px] font-black uppercase tracking-widest border-none">
                {assignments.filter(a => !a.is_confirmed).length} Unconfirmed
             </Badge>
          </div>
        </div>
        <div className="flex gap-3">
           <Button variant="outline" className="h-11 px-6 rounded-xl font-bold border-slate-200 shadow-sm">Export List</Button>
           <Button className="h-11 px-6 rounded-xl font-bold bg-primary shadow-xl shadow-primary/20">Assign Crew</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
         <div className="relative flex-1 md:w-80 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input placeholder="Search member, booking or client..." className="pl-10 h-11 border-slate-200 rounded-xl bg-white shadow-sm" />
         </div>
         <Button variant="outline" className="h-11 rounded-xl border-slate-200 font-bold px-6 bg-white shadow-sm">
            <Filter className="w-4 h-4 mr-2" /> Filter
         </Button>
         <Button variant="outline" className="h-11 rounded-xl border-amber-200 text-amber-700 font-black text-xs uppercase tracking-widest px-6 bg-amber-50">
            Show Unconfirmed 
         </Button>
      </div>

      <Card className="border-none shadow-2xl shadow-slate-200/50 rounded-[2.5rem] overflow-hidden bg-white">
         <Table>
            <TableHeader className="bg-slate-50/50">
               <TableRow className="border-b-slate-100 hover:bg-transparent h-14">
                  <TableHead className="px-8 text-[10px] font-black uppercase tracking-widest text-slate-400">Date & Time</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Booking</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400">Team Member</TableHead>
                  <TableHead className="text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Status</TableHead>
                  <TableHead className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Action</TableHead>
               </TableRow>
            </TableHeader>
            <TableBody>
               {assignments.map((as) => (
                 <TableRow key={as.id} className="group border-b-slate-50 hover:bg-slate-50/50 transition-colors">
                    <TableCell className="px-8 whitespace-nowrap">
                       <div className="text-xs font-bold text-slate-900">{format(new Date(as.event_date), "dd MMM, yyyy")}</div>
                       <div className="text-[10px] font-black text-slate-400 uppercase tracking-tighter flex items-center gap-1.5 mt-0.5">
                          <Clock className="w-3 h-3" /> {as.call_time}
                       </div>
                    </TableCell>
                    <TableCell>
                       <div className="text-sm font-bold text-slate-900 leading-tight">{as.booking_title}</div>
                       <div className="text-[10px] text-slate-400 font-medium">{as.client_name}</div>
                    </TableCell>
                    <TableCell>
                       <div className="flex items-center gap-3">
                          <Avatar className="w-8 h-8 rounded-lg shadow-sm border border-white">
                             <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-black">
                                {as.member_name.charAt(0)}
                             </AvatarFallback>
                          </Avatar>
                          <div>
                             <div className="text-xs font-bold text-slate-900">{as.member_name}</div>
                             <div className="text-[9px] font-black uppercase text-slate-400 tracking-tighter">{as.role}</div>
                          </div>
                       </div>
                    </TableCell>
                    <TableCell className="text-center">
                       {as.is_confirmed ? (
                         <div className="flex items-center justify-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600">Confirmed</span>
                         </div>
                       ) : (
                         <div className="flex items-center justify-center gap-2">
                            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Pending</span>
                         </div>
                       )}
                    </TableCell>
                    <TableCell className="pr-8 text-right">
                       <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button variant="outline" size="sm" className="h-8 text-[10px] font-black uppercase tracking-widest rounded-lg border-slate-100">Send Link</Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg border border-slate-100 shadow-sm bg-white" asChild>
                             <Link href={`/bookings/${as.booking_id}`}>
                               <ArrowRight className="w-4 h-4 text-slate-400" />
                             </Link>
                          </Button>
                       </div>
                    </TableCell>
                 </TableRow>
               ))}
            </TableBody>
         </Table>
      </Card>
    </div>
  );
}
