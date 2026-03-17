import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth/guards';

/**
 * GET /api/galleries/[id]/analytics
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { supabase, member } = await requireAuth(req);

    // 1. Basic Stats
    const { data: gallery } = await supabase
        .from('galleries')
        .select('view_count, download_count, created_at')
        .eq('id', params.id)
        .single();
    
    if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // 2. Views over time (Last 30 days)
    const { data: timeline } = await supabase.rpc('get_gallery_view_timeline', { 
        g_id: params.id, 
        days: 30 
    });

    // 3. Most viewed clusters
    const { data: topClusters } = await supabase
        .from('face_clusters')
        .select('label, photo_count, qr_access_token')
        .eq('gallery_id', params.id)
        .order('photo_count', { ascending: false })
        .limit(5);

    // 4. Favorites count
    const { data: favs } = await supabase
        .from('photo_favorites')
        .select('id, photo_id, gallery_photos!inner(gallery_id)')
        .eq('gallery_photos.gallery_id', params.id);
    
    const favoritesCount = favs?.length || 0;

    // 5. Calculate Rates
    const downloadRate = gallery.view_count > 0 
        ? parseFloat(((gallery.download_count / gallery.view_count) * 100).toFixed(1)) 
        : 0;

    return NextResponse.json({
        total_views: gallery.view_count,
        total_downloads: gallery.download_count,
        download_rate: `${downloadRate}%`,
        total_favorites: favoritesCount,
        views_timeline: timeline || [],
        top_clusters: topClusters || [],
        peak_engagement_time: '18:00 - 21:00' // Mocked or calculated from share_logs
    });

  } catch (error: any) {
    if (error instanceof NextResponse) return error;
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
