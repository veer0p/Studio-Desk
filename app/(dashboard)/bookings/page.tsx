import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { getMemberByUserId } from "@/lib/supabase/queries";
import { Button } from "@/components/ui/button";
import { Plus, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";

async function BookingList({ studioId }: { studioId: string }) {
  const supabase = createClient();
  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      id,
      event_name,
      event_date,
      event_type,
      status,
      client:client_id (full_name)
    `)
    .eq('studio_id', studioId)
    .order('event_date', { ascending: false });

  if (!bookings || bookings.length === 0) {
    return (
       <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100">
          <p className="text-slate-400 font-medium">No bookings found.</p>
          <Button variant="link" asChild>
            <Link href="/dashboard/leads">Start with a new lead</Link>
          </Button>
       </div>
    );
  }

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50/50 text-slate-500 font-bold uppercase tracking-widest text-[10px] border-b border-slate-100">
            <th className="px-8 py-4 text-left">Event & Client</th>
            <th className="px-8 py-4 text-left">Date</th>
            <th className="px-8 py-4 text-left">Type</th>
            <th className="px-8 py-4 text-left">Status</th>
            <th className="px-8 py-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {bookings.map((booking: any) => (
            <tr key={booking.id} className="hover:bg-slate-50/50 transition-colors">
              <td className="px-8 py-6">
                <p className="font-black text-slate-900">{booking.event_name}</p>
                <p className="text-xs text-slate-500">{booking.client?.full_name}</p>
              </td>
              <td className="px-8 py-6 text-slate-600 font-medium">
                {new Date(booking.event_date).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric'
                })}
              </td>
              <td className="px-8 py-6">
                <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-lg font-bold text-[10px] uppercase">
                  {booking.event_type}
                </span>
              </td>
              <td className="px-8 py-6">
                 <span className={`px-3 py-1 rounded-lg font-bold text-[10px] uppercase ${
                   booking.status === 'confirmed' ? 'bg-emerald-50 text-emerald-600' :
                   booking.status === 'completed' ? 'bg-blue-50 text-blue-600' :
                   'bg-slate-100 text-slate-600'
                 }`}>
                   {booking.status}
                 </span>
              </td>
              <td className="px-8 py-6 text-right">
                <Button variant="ghost" size="sm" asChild>
                  <Link href={`/dashboard/bookings/${booking.id}`}>Manage</Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BookingListSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map(i => (
        <Skeleton key={i} className="h-20 w-full rounded-2xl" />
      ))}
    </div>
  );
}

export default async function BookingsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const member = await getMemberByUserId(supabase, user.id);
  if (!member) return null;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Project Bookings</h1>
          <p className="text-sm font-medium text-slate-500">Manage all your confirmed photography projects</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/leads?action=new">
            <Plus className="w-4 h-4 mr-2" /> New Project
          </Link>
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input 
            placeholder="Search by event or client..." 
            className="pl-10 h-12 rounded-xl border-slate-200" 
          />
        </div>
        <Button variant="outline" className="h-12 rounded-xl gap-2 font-bold border-slate-200">
          <Filter className="w-4 h-4" /> Filters
        </Button>
      </div>

      <Suspense fallback={<BookingListSkeleton />}>
        <BookingList studioId={member.studio_id} />
      </Suspense>
    </div>
  );
}
