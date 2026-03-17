import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * POST /api/galleries/public/[slug]/favorite
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createAdminClient();
    const { photo_id, guest_token } = await req.json();

    // Validate photo belongs to gallery
    const { data: photo } = await supabase
        .from('gallery_photos')
        .select('galleries(slug)')
        .eq('id', photo_id)
        .single();
    
    if (!photo || (photo.galleries as any).slug !== params.slug) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await supabase.from('photo_favorites').upsert({
        photo_id,
        guest_token
    }, { onConflict: 'photo_id, guest_token' });

    return NextResponse.json({ favorited: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

/**
 * DELETE /api/galleries/public/[slug]/favorite
 */
export async function DELETE(
    req: NextRequest,
    { params }: { params: { slug: string } }
  ) {
    try {
      const supabase = createAdminClient();
      const { photo_id, guest_token } = await req.json();
  
      await supabase
        .from('photo_favorites')
        .delete()
        .eq('photo_id', photo_id)
        .eq('guest_token', guest_token);
  
      return NextResponse.json({ favorited: false });
    } catch (error: any) {
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }
