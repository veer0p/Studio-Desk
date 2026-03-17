import { Plus, Users, Mail, Phone, Calendar as CalendarIcon, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamMemberCard } from "@/components/team/TeamMemberCard";
import { InviteMemberDrawer } from "@/components/team/InviteMemberDrawer";
import { cn } from "@/lib/utils";

// Mock data fetching
async function getTeamData() {
  return {
    members: [
      {
        id: "1",
        display_name: "Viraj Patel",
        email: "viraj@studiodesk.in",
        role: "owner",
        is_active: true,
        specializations: ["Wedding", "Concert"],
        avatar_url: "",
        joined_at: "2024-01-01",
      },
      {
        id: "2",
        display_name: "Sneha Rao",
        email: "sneha@studiodesk.in",
        role: "photographer",
        is_active: true,
        specializations: ["Portrait", "Product"],
        avatar_url: "",
        joined_at: "2024-02-15",
      },
      {
        id: "3",
        display_name: "Rahul Mehra",
        email: "rahul@studiodesk.in",
        role: "videographer",
        is_active: true,
        specializations: ["Cinematic", "Drone"],
        avatar_url: "",
        joined_at: "2024-03-01",
      },
    ],
    pendingInvites: [
      { id: "inv-1", email: "amit@example.com", role: "editor", sent_date: "2025-03-10", expires: "2025-03-17" },
    ]
  };
}

export default async function TeamPage() {
  const { members, pendingInvites } = await getTeamData();

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <div className="flex items-center gap-2 mt-1">
             <span className="text-sm text-muted-foreground">{members.length} Active Members</span>
             {pendingInvites.length > 0 && (
               <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 h-5 text-[10px] font-bold">
                 {pendingInvites.length} Pending
               </Badge>
             )}
          </div>
        </div>
        <InviteMemberDrawer />
      </div>

      <div className="space-y-12">
        {/* Team Members Grid */}
        <section className="space-y-6">
           <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-slate-400" />
              <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Team Members</h2>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {members.map((member) => (
                <TeamMemberCard key={member.id} member={member as any} />
              ))}
           </div>
        </section>

        {/* Pending Invitations */}
        {pendingInvites.length > 0 && (
          <section className="space-y-6">
             <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-slate-400" />
                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-slate-400">Pending Invitations</h2>
             </div>
             <Card className="border-none shadow-xl shadow-slate-200/50 rounded-3xl overflow-hidden">
                <div className="divide-y divide-slate-50">
                   {pendingInvites.map((invite) => (
                     <div key={invite.id} className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group hover:bg-slate-50/50 transition-colors">
                        <div className="flex gap-4 items-center">
                           <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                              <Mail className="w-5 h-5" />
                           </div>
                           <div>
                              <div className="font-bold text-slate-900">{invite.email}</div>
                              <div className="flex items-center gap-2 mt-0.5">
                                 <Badge variant="outline" className="text-[9px] font-black uppercase tracking-tighter border-slate-200">
                                    {invite.role}
                                 </Badge>
                                 <span className="text-[10px] text-slate-400 font-medium">Sent {invite.sent_date}</span>
                              </div>
                           </div>
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                           <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest hidden lg:block">Expires: {invite.expires}</div>
                           <Button variant="outline" className="h-9 rounded-xl text-xs font-bold border-slate-200 hover:bg-white hover:text-primary transition-all">Resend</Button>
                           <Button variant="ghost" className="h-9 rounded-xl text-xs font-bold text-rose-500 hover:text-rose-600 hover:bg-rose-50">Cancel</Button>
                        </div>
                     </div>
                   ))}
                </div>
             </Card>
          </section>
        )}
      </div>
    </div>
  );
}
