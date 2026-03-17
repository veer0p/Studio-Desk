# 🚀 StudioDesk Launch Checklist

Follow these steps to successfully deploy StudioDesk to production.

## 1. Environment Configuration (Vercel)
- [ ] Add `SUPABASE_SERVICE_ROLE_KEY` to Vercel Environment Variables.
- [ ] Add `CRON_SECRET` (generate a long random string) for securing cron endpoints.
- [ ] Add `NEXT_PUBLIC_SENTRY_DSN` for error monitoring.
- [ ] Add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` (Live keys).
- [ ] Update `NEXT_PUBLIC_APP_URL` to your production domain (e.g., `https://studiodesk.in`).

## 2. Supabase Settings
- [ ] Run the SQL migration for `check_rate_limit` RPC function.
- [ ] Ensure `studios` table has a policy allowing public read for `generateMetadata` (already configured).
- [ ] Set up daily database backups.

## 3. SEO & PWA
- [ ] Verify `public/manifest.json` icons are uploaded to the public folder.
- [ ] Test `sitemap.xml` on the production domain.
- [ ] Validate OpenGraph previews using [opengraph.xyz](https://www.opengraph.xyz/).

## 4. Payment Integration (Razorpay)
- [ ] Switch Razorpay to **Live Mode**.
- [ ] Update the webhook URL in Razorpay Dashboard to `https://your-domain.com/api/webhooks/razorpay`.
- [ ] Ensure the webhook secret matches the environment variable.

## 5. Mobile & PWA Verification
- [ ] Open the site on Safari (iOS) and Chrome (Android).
- [ ] Verify the "Add to Home Screen" prompt appears.
- [ ] Test the signature pad with a physical finger/stylus.

## 6. Final Sanity Checks
- [ ] Create a "Test Booking" and ensure the flow works end-to-end.
- [ ] Verify that a "Paid" invoice correctly updates the booking status.
- [ ] Check Sentry for any "Silent" errors during the test flow.

---
**StudioDesk Version 1.0.0 - Production Ready**
