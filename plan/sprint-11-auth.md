# Sprint 11 — Auth (final V1 sprint)

**Status:** Done
**Started:** 2026-05-11
**Finished:** 2026-05-11

## Goal
Replace the dev-auth shim with real Supabase cookie-based sessions: login, signup, forgot-password, reset-password pages; protected route guard; AuthProvider; session expiry handling.

## API contracts verified
- [x] `POST /auth/login` — returns `{ user, member, studio }` (Supabase + studio context)
- [x] `POST /auth/signup` — returns `{ user, studio }`
- [x] `GET /auth/me` — returns `{ user, member, studio }`; `user.user_metadata.full_name` for name
- [x] `POST /auth/logout` — clears httpOnly session cookie
- [x] `POST /auth/forgot-password` — always 200 (no account leak)
- [x] `POST /auth/update-password` — requires active recovery session

## Build tasks
- [x] `src/lib/validations/auth.schema.ts` — loginSchema, signupSchema, forgotPasswordSchema, resetPasswordSchema
- [x] `src/lib/api/endpoints/auth.ts` — authLogin, authSignup, authMe (with mapMe()), authLogout, authForgotPassword, authUpdatePassword
- [x] `src/lib/auth/AuthProvider.tsx` — AuthProviderLayout (root layout route), useAuth(), useMe(); replaces devShim
- [x] `src/components/layout/ProtectedOutlet.tsx` — loading spinner → AppShell or redirect /login
- [x] `src/features/auth/LoginPage.tsx` — email + password, redirects to original destination
- [x] `src/features/auth/SignupPage.tsx` — fullName, email, password, studioName, studioSlug (auto-slugified); auto-login after signup
- [x] `src/features/auth/ForgotPasswordPage.tsx` — email only; always shows success state
- [x] `src/features/auth/ResetPasswordPage.tsx` — password + confirmPassword; requires authenticated recovery session
- [x] `src/lib/api/client.ts` — 401 hook: dispatch `auth:unauthorized` CustomEvent (skipped on auth pages)
- [x] `src/app/providers.tsx` — removed DevAuthBootstrap / devShim import
- [x] `src/app/router.tsx` — AuthProviderLayout as root, ProtectedOutlet wrapping app routes, auth pages as standalone routes
- [x] `src/components/layout/TopBar.tsx` — real useMe/useAuth, avatar dropdown with name + email + Sign out button, removed Dev Auth banner
- [x] `src/components/layout/NavTree.tsx` — import useMe from AuthProvider (was devShim)

## Polish tasks
- [x] Auth pages have no sidebar/topbar (outside AppShell)
- [x] Login redirects to original destination via `location.state.from`
- [x] Signup slugifies studioName automatically
- [x] No account leak on forgot-password (always shows success)
- [x] Avatar initial uses `.toUpperCase()` for safety
- [x] Logout dropdown shows full name + email before the sign-out button

## Test file
- [x] `frontend/testing/auth.md` written — 13 tests covering login, logout, signup, redirect, session expiry, auth page layout

## API issues found this sprint
None — all six auth endpoints exist and match contract.

## Typecheck
- [x] `npm run typecheck` — zero errors

## Sign-off
- [ ] User walks all 13 tests in `frontend/testing/auth.md`
- [ ] User says "looks good, Sprint 11 done — V1 complete"
