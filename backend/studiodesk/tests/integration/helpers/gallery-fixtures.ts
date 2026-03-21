import { createAdminClient } from '@/lib/supabase/admin'
import {
  BOOKING_CONTRACT_SIGNED_ID,
  BOOKING_CONVERTED_ID,
  BOOKING_GALLERY_B_ID,
  BOOKING_INVOICE_NEW_ID,
  CLIENT_MEERA_ID,
  CLIENT_PRIYA_ID,
  CLIENT_RAJ_ID,
  CLIENT_VIKRAM_ID,
  FACE_CLUSTER_BRIDE_ID,
  FACE_CLUSTER_GROOM_ID,
  FACE_CLUSTER_UNKNOWN_ID,
  GALLERY_DRAFT_ID,
  GALLERY_DRAFT_TOKEN,
  GALLERY_PUBLISHED_ID,
  GALLERY_PUBLISHED_TOKEN,
  GALLERY_STUDIO_B_ID,
  GALLERY_STUDIO_B_TOKEN,
  IMMICH_PERSON_BRIDE_ID,
  IMMICH_PERSON_GROOM_ID,
  IMMICH_PERSON_UNKNOWN_ID,
  STUDIO_A_ID,
  STUDIO_B_ID,
  UPLOAD_JOB_COMPLETED_ID,
  UPLOAD_JOB_PROCESSING_ID,
} from '../../../supabase/seed'

function addDays(n: number) {
  const value = new Date()
  value.setDate(value.getDate() + n)
  return value
}

export async function resetGalleryFixtures() {
  const admin = createAdminClient()
  const publishedAt = addDays(-2).toISOString()
  const expiry = addDays(30).toISOString()

  await (admin.from('gallery_share_logs') as any).delete().in('studio_id', [STUDIO_A_ID, STUDIO_B_ID])
  await (admin.from('gallery_photos') as any).delete().in('studio_id', [STUDIO_A_ID, STUDIO_B_ID])
  await (admin.from('gallery_videos') as any).delete().in('studio_id', [STUDIO_A_ID, STUDIO_B_ID])
  await (admin.from('face_clusters') as any).delete().in('studio_id', [STUDIO_A_ID, STUDIO_B_ID])
  await (admin.from('file_upload_jobs') as any).delete().in('studio_id', [STUDIO_A_ID, STUDIO_B_ID])
  await (admin.from('galleries') as any).delete().in('studio_id', [STUDIO_A_ID, STUDIO_B_ID])
  await (admin.from('rate_limits') as any).delete().like('key', 'gallery_lookup:%')
  await (admin.from('rate_limits') as any).delete().like('key', 'public_gallery:%')

  await (admin.from('bookings') as any).upsert(
    [
      {
        id: BOOKING_CONVERTED_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_PRIYA_ID,
        title: 'Priya Sharma - Wedding',
        event_type: 'wedding',
        event_date: addDays(60).toISOString().slice(0, 10),
        venue_name: 'Hotel Grand, Surat',
        total_amount: 85000,
        advance_amount: 25500,
        amount_paid: 25500,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
      },
      {
        id: BOOKING_INVOICE_NEW_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_MEERA_ID,
        title: 'Meera Patel - Portrait Session',
        event_type: 'portrait',
        event_date: addDays(20).toISOString().slice(0, 10),
        venue_name: 'Studio One, Surat',
        total_amount: 18000,
        advance_amount: 5000,
        amount_paid: 0,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
      },
      {
        id: BOOKING_CONTRACT_SIGNED_ID,
        studio_id: STUDIO_A_ID,
        client_id: CLIENT_RAJ_ID,
        title: 'Raj Kumar - Corporate Event',
        event_type: 'corporate',
        event_date: addDays(40).toISOString().slice(0, 10),
        venue_name: 'Convention Centre, Ahmedabad',
        total_amount: 45000,
        advance_amount: 15000,
        amount_paid: 15000,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
      },
      {
        id: BOOKING_GALLERY_B_ID,
        studio_id: STUDIO_B_ID,
        client_id: CLIENT_VIKRAM_ID,
        title: 'Vikram Mehta - Studio B Wedding',
        event_type: 'wedding',
        event_date: addDays(50).toISOString().slice(0, 10),
        venue_name: 'Riverfront Lawn, Ahmedabad',
        total_amount: 95000,
        advance_amount: 25000,
        amount_paid: 0,
        gst_type: 'cgst_sgst',
        status: 'contract_signed',
      },
    ],
    { onConflict: 'id' }
  )

  await (admin.from('galleries') as any).upsert(
    [
      {
        id: GALLERY_DRAFT_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_CONVERTED_ID,
        immich_album_id: 'mock-draft-album-id',
        immich_library_id: JSON.stringify({ name: 'Priya Wedding Draft Gallery' }),
        status: 'ready',
        total_photos: 0,
        total_videos: 0,
        total_size_mb: 0,
        is_published: false,
        is_download_enabled: false,
        slug: 'priya-wedding-gallery-draft',
        access_token: GALLERY_DRAFT_TOKEN,
        view_count: 0,
        download_count: 0,
        expires_at: expiry,
      },
      {
        id: GALLERY_PUBLISHED_ID,
        studio_id: STUDIO_A_ID,
        booking_id: BOOKING_CONTRACT_SIGNED_ID,
        immich_album_id: 'mock-album-id',
        immich_library_id: JSON.stringify({
          name: 'Sharma Wedding Gallery',
          share_link_url: 'https://test.immich.app/share/xxx',
          share_link_immich_id: 'share_immich_seed_001',
          qr_code_url: 'https://studiodesk.test/gallery/sharma-wedding-gallery-test',
          cover_photo_immich_id: 'asset-priya-1',
        }),
        status: 'published',
        total_photos: 450,
        total_videos: 2,
        total_size_mb: 1024.5,
        is_published: true,
        is_download_enabled: true,
        published_at: publishedAt,
        download_enabled_at: publishedAt,
        slug: 'sharma-wedding-gallery-test',
        access_token: GALLERY_PUBLISHED_TOKEN,
        view_count: 45,
        download_count: 3,
        expires_at: expiry,
      },
      {
        id: GALLERY_STUDIO_B_ID,
        studio_id: STUDIO_B_ID,
        booking_id: BOOKING_GALLERY_B_ID,
        immich_album_id: 'mock-b-album-id',
        immich_library_id: JSON.stringify({ name: 'Studio B Private Gallery' }),
        status: 'ready',
        total_photos: 12,
        total_videos: 0,
        total_size_mb: 48.2,
        is_published: false,
        is_download_enabled: false,
        slug: 'studio-b-gallery-test',
        access_token: GALLERY_STUDIO_B_TOKEN,
        view_count: 0,
        download_count: 0,
        expires_at: expiry,
      },
    ],
    { onConflict: 'id' }
  )

  await (admin.from('face_clusters') as any).insert([
    {
      id: FACE_CLUSTER_BRIDE_ID,
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_person_id: IMMICH_PERSON_BRIDE_ID,
      label: 'Bride - Priya',
      is_labeled: true,
      photo_count: 127,
      representative_photo_url: 'https://thumb.test/priya.jpg',
    },
    {
      id: FACE_CLUSTER_UNKNOWN_ID,
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_person_id: IMMICH_PERSON_UNKNOWN_ID,
      label: null,
      is_labeled: false,
      photo_count: 43,
      representative_photo_url: 'https://thumb.test/unknown.jpg',
    },
    {
      id: FACE_CLUSTER_GROOM_ID,
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_person_id: IMMICH_PERSON_GROOM_ID,
      label: 'Groom - Raj',
      is_labeled: true,
      photo_count: 98,
      representative_photo_url: 'https://thumb.test/raj.jpg',
    },
  ])

  await (admin.from('gallery_photos') as any).insert([
    {
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_asset_id: 'asset-priya-1',
      filename: 'priya-1.jpg',
      file_size_mb: 4.2,
      taken_at: addDays(-10).toISOString(),
      face_cluster_ids: [IMMICH_PERSON_BRIDE_ID],
    },
    {
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_asset_id: 'asset-priya-2',
      filename: 'priya-2.jpg',
      file_size_mb: 4.8,
      taken_at: addDays(-10).toISOString(),
      face_cluster_ids: [IMMICH_PERSON_BRIDE_ID],
    },
    {
      gallery_id: GALLERY_PUBLISHED_ID,
      studio_id: STUDIO_A_ID,
      immich_asset_id: 'asset-raj-1',
      filename: 'raj-1.jpg',
      file_size_mb: 5.1,
      taken_at: addDays(-10).toISOString(),
      face_cluster_ids: [IMMICH_PERSON_GROOM_ID],
    },
  ])

  await (admin.from('file_upload_jobs') as any).insert([
    {
      id: UPLOAD_JOB_COMPLETED_ID,
      studio_id: STUDIO_A_ID,
      gallery_id: GALLERY_DRAFT_ID,
      status: 'completed',
      total_files: 50,
      processed_files: 50,
      failed_files: 0,
      total_size_mb: 250,
      processed_size_mb: 250,
      started_at: addDays(-1).toISOString(),
      completed_at: addDays(-1).toISOString(),
      error_log: [],
    },
    {
      id: UPLOAD_JOB_PROCESSING_ID,
      studio_id: STUDIO_A_ID,
      gallery_id: GALLERY_DRAFT_ID,
      status: 'processing',
      total_files: 50,
      processed_files: 30,
      failed_files: 0,
      total_size_mb: 250,
      processed_size_mb: 150,
      started_at: addDays(-1).toISOString(),
      error_log: [],
    },
  ])
}
