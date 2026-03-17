import { createAdminClient } from "@/lib/supabase/admin";

export async function getDashboardStats(studioId: string) {
  const supabase = createAdminClient();
  
  const currentMonthStart = new Date();
  currentMonthStart.setDate(1);
  currentMonthStart.setHours(0, 0, 0, 0);

  const { data: snapshot } = await supabase
    .from('revenue_snapshots')
    .select('*')
    .eq('studio_id', studioId)
    .gte('snapshot_date', currentMonthStart.toISOString().split('T')[0])
    .order('snapshot_date', { ascending: false })
    .limit(1)
    .single();

  const castSnapshot = snapshot as any;

  return {
    revenue: castSnapshot?.revenue_collected || 0,
    bookings: castSnapshot?.total_bookings || 0,
    photos: castSnapshot?.photos_delivered || 0,
    pending_revenue: 0,
  };
}

export async function getPendingActions(studioId: string) {
  const supabase = createAdminClient();
  
  const [
    { count: unsignedContracts },
    { count: overdueInvoices },
    { count: unreadMessages }
  ] = await Promise.all([
    supabase.from('contracts').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).eq('status', 'sent'),
    supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).eq('status', 'sent').lt('due_date', new Date().toISOString()),
    supabase.from('client_messages').select('*', { count: 'exact', head: true }).eq('studio_id', studioId).eq('sender_type', 'client').eq('is_read', false),
  ]);

  return {
    unsignedContracts: unsignedContracts || 0,
    overdueInvoices: overdueInvoices || 0,
    unreadMessages: unreadMessages || 0,
  };
}

export async function getUpcomingShoots(studioId: string) {
  const supabase = createAdminClient();
  const next7Days = new Date();
  next7Days.setDate(next7Days.getDate() + 7);

  const { data } = await supabase
    .from('bookings')
    .select(`
      id,
      event_name,
      event_date,
      event_type,
      venue_city,
      status,
      client:client_id (full_name),
      shoot_assignments (count)
    `)
    .eq('studio_id', studioId)
    .gte('event_date', new Date().toISOString().split('T')[0])
    .lte('event_date', next7Days.toISOString().split('T')[0])
    .order('event_date', { ascending: true });

  return (data as any[])?.map(b => ({
    id: b.id,
    client_name: b.client?.full_name || 'Unknown',
    event_type: b.event_type,
    shoot_date: b.event_date,
    location: b.venue_city || 'TBD',
    status: b.status,
    assignedCount: b.shoot_assignments?.[0]?.count || 0
  })) || [];
}

export async function getRecentActivity(studioId: string) {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from('booking_activity_feed')
    .select(`
      id,
      activity_type,
      created_at,
      metadata,
      booking:booking_id (event_name)
    `)
    .eq('studio_id', studioId)
    .order('created_at', { ascending: false })
    .limit(10);

  return (data as any[])?.map(a => ({
    id: a.id,
    event_type: a.activity_type,
    metadata: {
      ...a.metadata,
      booking_title: a.booking?.event_name
    },
    created_at: a.created_at
  })) || [];
}

