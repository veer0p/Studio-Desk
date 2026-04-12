# AI Gallery & Immich Integration API

## Endpoints

### `GET /api/v1/galleries`
- Auth: member
- Returns paginated galleries for the current studio.
- Query: `booking_id`, `status`, `page`, `pageSize`
- Notes:
  - `status=draft` maps to internal `processing` and `ready`
  - Response includes booking/client summary fields

### `POST /api/v1/galleries`
- Auth: owner
- Creates a gallery for a booking.
- Rules:
  - One gallery per booking
  - Attempts to create the Immich album immediately
  - If album creation fails, the gallery still gets created and can recover later

### `GET /api/v1/galleries/:id`
- Auth: member
- Returns gallery detail plus current face clusters.

### `PATCH /api/v1/galleries/:id`
- Auth: owner
- Updates gallery metadata.
- Current mutable field: `name`

### `POST /api/v1/galleries/:id/upload`
- Auth: member
- Queues upload work and returns `job_id`.
- Notes:
  - Upload is always async
  - The route never uploads directly to Immich
  - Storage quota is checked before the job is created

### `GET /api/v1/galleries/:id/upload-status`
- Auth: member
- Query: `job_id`
- Returns current upload job counters and `progress_pct`.

### `GET /api/v1/galleries/:id/clusters`
- Auth: member
- Returns current face clusters from the database.
- Also triggers a non-blocking Immich sync in the background.

### `PATCH /api/v1/galleries/:id/clusters/:cid`
- Auth: member
- Labels a face cluster in both StudioDesk and Immich.

### `POST /api/v1/galleries/:id/publish`
- Auth: owner
- Publishes a gallery and creates an Immich share link.
- Rules:
  - Empty galleries cannot be published
  - Already published galleries return conflict
  - QR URL points to the StudioDesk public gallery page

### `GET /api/v1/galleries/:id/share`
- Auth: member
- Returns share metadata, public URL, QR URL, expiry, and counters.

### `GET /api/v1/gallery/:slug`
- Auth: public
- Returns the public gallery payload.
- Cache: `public, max-age=60, stale-while-revalidate=300`
- Notes:
  - Only published, non-expired galleries are visible
  - Response excludes internal IDs and tokens
  - Only labeled face clusters are exposed publicly

### `POST /api/v1/gallery/:slug/lookup`
- Auth: public
- Performs guest selfie lookup.
- Rules:
  - Rate limit: 10 lookups per IP per hour
  - Guest selfies are never stored permanently
  - Temporary selfie assets are always deleted in the same request lifecycle
  - Returns matched gallery photos only

## Immich Notes
- All Immich calls go through `lib/services/immich.service.ts`.
- One Immich credential set is used per studio context.
- Upload jobs are asynchronous.
- Face clustering is eventually consistent; cluster sync is fire-and-forget.

## Security Notes
- Immich API keys are only used server-side.
- Public endpoints never expose `immich_album_id`, `access_token`, or studio financial data.
- Guest selfie lookup is tokenless but IP rate limited.
- Selfie assets are deleted even when lookup fails.
