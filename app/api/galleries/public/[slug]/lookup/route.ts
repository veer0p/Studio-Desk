import { NextRequest, NextResponse } from 'next/server';
import { immichClient } from '@/lib/immich/client';
import { createAdminClient } from '@/lib/supabase/admin';
import { logSecurityEvent } from '@/lib/logger';

/**
 * POST /api/galleries/public/[slug]/lookup
 * Guest selfie-based photo lookup (NO auth)
 */
/**
 * @swagger
 * /api/galleries/public/{slug}/lookup:
 *   post:
 *     summary: Guest face-search (AI selfie lookup)
 *     description: |
 *       Accepts a guest selfie, searches Immich for matching faces, and returns the 
 *       access token of the matching labeled cluster if found.
 *     tags: [Public]
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema: { type: string }
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               selfie: { type: string, format: binary }
 *     responses:
 *       200:
 *         description: Lookup results
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 matched: { type: boolean }
 *                 photo_count: { type: integer }
 *                 access_token: { type: string }
 *                 label: { type: string }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const supabase = createAdminClient();
    const formData = await req.formData();
    const selfie = formData.get('selfie') as File;

    if (!selfie) return NextResponse.json({ error: 'No selfie provided' }, { status: 400 });
    if (selfie.size > 5 * 1024 * 1024) return NextResponse.json({ error: 'Selfie too large' }, { status: 400 });

    // 1. Fetch gallery
    const { data: gallery } = await supabase.from('galleries').select('id, immich_library_id, studio_id').eq('slug', params.slug).single();
    if (!gallery) return NextResponse.json({ error: 'Gallery not found' }, { status: 404 });

    // 2. Search by Face (In memory)
    const buffer = Buffer.from(await selfie.arrayBuffer());
    const matchedPeople = await immichClient.searchByFace(buffer);

    // 3. Match against gallery clusters
    const clusterIds = matchedPeople.map(p => p.id);
    const { data: matchedClusters } = await supabase
        .from('face_clusters')
        .select('*')
        .eq('gallery_id', gallery.id)
        .in('immich_person_id', clusterIds);

    // 4. Cleanup buffer explicitly
    (buffer as any) = null;

    if (!matchedClusters || matchedClusters.length === 0) {
        await supabase.from('guest_selfie_lookups').insert({
            gallery_id: gallery.id,
            matched_photo_count: 0,
            ip_address: req.ip || 'unknown'
        });
        return NextResponse.json({ matched: false, suggestion: 'No match found. Try again in better lighting.' });
    }

    // 5. Success
    const bestMatch = matchedClusters[0];
    await supabase.from('guest_selfie_lookups').insert({
        gallery_id: gallery.id,
        face_cluster_id: bestMatch.id,
        matched_photo_count: bestMatch.photo_count,
        ip_address: req.ip || 'unknown'
    });

    return NextResponse.json({
        matched: true,
        photo_count: bestMatch.photo_count,
        access_token: bestMatch.qr_access_token,
        label: bestMatch.label
    });

  } catch (error: any) {
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
