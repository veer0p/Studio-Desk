# Sprint 9 — Gallery

**Status:** Done
**Started:** 2026-05-11
**Finished:** 2026-05-11

## Goal
Let a studio upload, publish, and share photo galleries linked to bookings. Face cluster labeling for AI-powered delivery.

## API contracts verified
- [x] `GET /galleries` — `Response.paginated()` ✅
- [x] `GET /galleries/:id` — includes `face_clusters`, `share_link_url`, `qr_code_url`
- [x] `POST /galleries` — `{ booking_id, name? }`
- [x] `PATCH /galleries/:id` — `{ is_download_enabled, expires_at, status }`
- [x] `POST /galleries/:id/upload` — `{ files: [{ name, type, data: base64 }] }` → `{ job_id, message }`
- [x] `GET /galleries/:id/upload-status?job_id=X` — polling endpoint
- [x] `POST /galleries/:id/publish` — `{ allow_download, expires_at? }`
- [x] `GET /galleries/:id/clusters` — face cluster list

## Build tasks
- [x] `src/features/galleries/types.ts` — GallerySummary, GalleryDetail, FaceCluster, UploadJob types
- [x] `src/lib/validations/gallery.schema.ts` — createGallerySchema, publishGallerySchema
- [x] `src/lib/api/endpoints/galleries.ts` — listGalleries, getGallery, createGallery, updateGallery, uploadPhotos, getUploadJob, publishGallery, getGalleryClusters
- [x] `src/lib/api/queryKeys.ts` — galleries keys (list, detail, clusters, uploadJob)
- [x] `src/features/galleries/hooks.ts` — all hooks; useUploadJob uses `refetchInterval` that stops on completed/failed
- [x] `src/features/galleries/GalleriesPage.tsx` — masonry-style grid, event_type color badges, empty state
- [x] `src/features/galleries/NewGalleryDialog.tsx` — booking combobox, name field
- [x] `src/features/galleries/GalleryDetailPage.tsx` — upload dropzone (base64 via FileReader), progress bar, publish dialog (z-[60]), face clusters tab, copy share link, QR code display
- [x] Router, NavTree, CommandPalette — Gallery enabled with sprint 9 badge

## Polish tasks
- [x] Upload converts files to base64 client-side (`FileReader.readAsDataURL`)
- [x] Upload job polls every 3 s, stops automatically on `completed`/`failed`
- [x] Empty state with real voice copy
- [x] PublishDialog renders at `z-[60]` above SlideOver z-50

## Test file
- [x] `frontend/testing/galleries.md` written — ~14 tests

## API issues found this sprint
None — all gallery endpoints exist and match contract.

## Sign-off
- [ ] User walks gallery tests
- [ ] User says "looks good, move on"
