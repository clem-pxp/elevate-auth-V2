# Implementation Plan: Codebase Reorganization + Critical Fixes

## Overview

Reorganize the entire codebase following Next.js App Router best practices while simultaneously fixing critical security issues and bugs. The design/UI is untouched — this is purely structural, organizational, and correctness work.

**Strategy:** Move files bottom-up (leaf dependencies first, then consumers), fix bugs in-place as files are touched, update all imports, then update documentation.

**Execution order:**
1. Create new directory structure
2. Move/reorganize lib files (deepest dependencies)
3. Move hooks, stores, types to top-level
4. Move onboarding flow to /onboarding route
5. Extract duplicated code & remove dead code
6. Apply bug/security fixes
7. Update all imports across the codebase
8. Update documentation

---

## Dependencies

Files must be moved in this order to avoid broken imports at any intermediate step:

1. `lib/` reorganization first (config/, auth/, validations/) — these are imported by everything
2. `hooks/`, `stores/`, `types/` move to top-level — imported by components
3. Route changes (signup → onboarding) — depends on updated imports
4. Component cleanup — depends on new paths being in place

---

## File Changes

### PHASE 1: Lib Reorganization

---

### `src/lib/config/firebase.ts` (MOVE from `src/lib/firebase-admin.ts`)

- Move the file to `src/lib/config/firebase.ts`
- Content stays identical — already has `import "server-only"` and correct singleton pattern
- All 8 files importing `@/lib/firebase-admin` will be updated in Phase 5

---

### `src/lib/config/stripe.ts` (MOVE from `src/lib/stripe.ts`)

- Move the file to `src/lib/config/stripe.ts`
- **FIX S1:** Add `import "server-only"` as the first line (follow the pattern in firebase-admin.ts)
- All 6 files importing `@/lib/stripe` will be updated in Phase 5

---

### `src/lib/config/env.ts` (NEW)

- Create a Zod-based environment variable validation module
- Define separate server and public env schemas:
  - Server: `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `FIREBASE_API_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `JWT_SECRET`
  - Public: `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_DEEP_LINK_SCHEME`, `NEXT_PUBLIC_APP_STORE_URL`, `NEXT_PUBLIC_PLAY_STORE_URL`
- Export a validated `serverEnv` object (only usable server-side) and `publicEnv` object
- Add `import "server-only"` for the server env export
- This replaces all `process.env.X!` non-null assertions across the codebase with validated, typed access

---

### `src/lib/auth/session.ts` (MOVE from `src/lib/auth.ts`)

- Move the file to `src/lib/auth/session.ts`
- Content stays identical — all exports (`signToken`, `verifyToken`, `setSessionCookie`, `clearSessionCookie`, `getSessionUser`) remain
- All 8 files importing `@/lib/auth` will be updated in Phase 5

---

### `src/lib/auth/helpers.ts` (NEW)

- Extract the duplicated subscription check logic from `login/route.ts:74-78` and `google/route.ts:62-65`
- Create a `getSubscriptionStatus(uid: string)` helper that:
  1. Gets user record from Firebase Admin
  2. Reads custom claims `subStatus.stripe`
  3. Returns `{ hasSubscription: boolean }` (checking for both `"active"` and `"trialing"` to fix the inconsistency)
- Extract the duplicated "Zod validation + first error message" pattern used in 5 API routes into a `parseBody<T>(schema, body)` helper that returns `{ data, errorResponse }` — reducing boilerplate in every route
- Add `import "server-only"`

---

### `src/lib/validations/auth.ts` (MOVE + SPLIT from `src/lib/validations.ts`)

- Move the login and signup schemas here
- Keep `signupSchema` (used by step-credentials.tsx for client-side form validation)
- Keep `loginSchema` (used by login-form.tsx and login/route.ts)
- Export `signupApiSchema` — the server-side schema for `/api/auth/signup` (just email + password, currently inline in signup/route.ts). This replaces the inline `signupBody` schema in signup/route.ts
- Export all type aliases: `SignupFormData`, `LoginFormData`

---

### `src/lib/validations/profile.ts` (NEW from inline code)

- Extract the `profileBody` Zod schema currently inline in `profile/update/route.ts:8-13` to this shared file
- Export as `profileSchema`
- Export `ProfileFormData` type
- Also export `checkoutSchema` (currently inline as `checkoutBody` in `create-checkout-session/route.ts:8-10`) — a simple `{ priceId: z.string().min(1) }` schema

---

### `src/lib/stripe-client.ts` (KEEP in place)

- No move needed — this is a client-side file and doesn't belong in `lib/config/`
- No changes required

---

### `src/lib/utils.ts` (KEEP in place)

- No changes required

---

### PHASE 2: Move Hooks, Stores, Types to Top-Level

---

### `src/hooks/use-stripe-prices.ts` (MOVE from `src/lib/hooks/use-stripe-prices.ts`)

- Move to `src/hooks/use-stripe-prices.ts`
- Update its internal import: `@/lib/types/stripe` → `@/types/stripe`
- Remove the now-empty `src/lib/hooks/` directory

---

### `src/stores/onboarding-store.ts` (MOVE from `src/lib/stores/onboarding-store.ts`)

- Move to `src/stores/onboarding-store.ts`
- No internal import changes needed
- Remove the now-empty `src/lib/stores/` directory

---

### `src/types/stripe.ts` (MOVE from `src/lib/types/stripe.ts`)

- Move to `src/types/stripe.ts`
- No internal import changes needed
- Remove the now-empty `src/lib/types/` directory

---

### `src/types/user.ts` (NEW)

- Create shared User/Profile types used across API routes and future account pages:
  - `FirestoreUser` interface matching the Firestore `users` collection schema from project-plan.md (uid, email, firstName, lastName, phone, birthDate, stripeCustomerId, subscriptionStatus, subscriptionPlan, subscriptionId, createdAt, updatedAt, source)
  - `UserCustomClaims` interface: `{ subStatus: { stripe: "active" | "inactive" }; roles?: string[] }`
- These types document the data model and will be used by API routes and account pages

---

### `src/types/api.ts` (NEW)

- Create shared API response types:
  - `ApiErrorResponse`: `{ error: string }`
  - `LoginResponse`: `{ hasSubscription: boolean }`
  - `SignupResponse`: `{ uid: string }`
- These document API contracts and can be used by both server routes and client fetch calls

---

### PHASE 3: Route Changes

---

### `src/app/onboarding/page.tsx` (NEW — move content from `src/app/signup/page.tsx`)

- Create `src/app/onboarding/` directory
- Move the current content of `signup/page.tsx` here (the full 4-step onboarding flow)
- Update the import: `@/components/onboarding/onboarding-form` → `@/components/onboarding/onboarding-tabs` (eliminating the wrapper)
- Change the component name from `SignupPage` to `OnboardingPage`
- The JSX stays identical (logo + OnboardingTabs + banner image)

---

### `src/app/signup/page.tsx` (REPURPOSE — redirect to onboarding)

- Replace the current onboarding flow content with a simple redirect to `/onboarding` (same pattern as `app/page.tsx` and `app/compte/page.tsx`)
- Use `import { redirect } from "next/navigation"` and `redirect("/onboarding")`
- This preserves backward-compatibility: any old links to `/signup` will work

---

### `src/app/page.tsx` (UPDATE redirect target)

- Currently redirects to `/signup`
- Update to redirect to `/onboarding` instead (since that's where the flow now lives)

---

### `src/middleware.ts` (UPDATE protected routes)

- **FIX S4:** Update `PROTECTED_ROUTES` from `["/onboarding", "/compte"]` to `["/onboarding", "/compte"]` — this now correctly matches the actual `/onboarding` route that exists
- Update the matcher config at bottom to: `["/onboarding/:path*", "/compte/:path*"]`
- Remove the duplicated `getSecret()` function — import it from `@/lib/auth/session` instead
- **Note:** The middleware uses Edge runtime which can't import `cookies()` from next/headers, but it CAN import a pure function like `getSecret()` that only uses `TextEncoder`. Verify this works; if not, keep `getSecret` inline in middleware.

---

### `src/app/api/stripe/create-checkout-session/route.ts` (UPDATE return URL)

- Change `return_url` from `${appUrl}/signup?session_id={CHECKOUT_SESSION_ID}` to `${appUrl}/onboarding?session_id={CHECKOUT_SESSION_ID}`
- This is critical — Stripe redirects back here after payment, and the onboarding page detects `session_id` to show the thank-you step

---

### `src/components/auth/login-form.tsx` (UPDATE redirect target)

- Line 41: Change `router.push("/signup")` to `router.push("/onboarding")` (redirect for users without subscription after login)

---

### PHASE 4: Component Cleanup & Icon Extraction

---

### `src/components/icons/elevate-icon.tsx` (NEW — extract from duplicates)

- Extract the Elevate "e" SVG icon that appears inline in `login/page.tsx:22-32` and `plan-card.tsx:17-32`
- Create a standalone `ElevateIcon` component following the same pattern as other icons in `src/components/icons/` (accepting `color` and `className` props)

---

### `src/components/icons/chevron-down-icon.tsx` (NEW — extract from compte-header.tsx)

- Extract the `ChevronDownIcon` currently defined locally inside `compte-header.tsx`
- Follow the same pattern as existing icons (arrow-back-icon.tsx, etc.)

---

### `src/components/icons/app-store-icon.tsx` (NEW — extract from step-merci.tsx)

- Extract the Apple App Store SVG icon (currently inline in `step-merci.tsx:91-114`)
- Accept `className` prop

---

### `src/components/icons/play-store-icon.tsx` (NEW — extract from step-merci.tsx)

- Extract the Google Play Store SVG icon (currently inline in `step-merci.tsx:118-133`)
- Accept `className` prop

---

### `src/app/login/page.tsx` (UPDATE — use extracted ElevateIcon)

- Replace the inline SVG at lines 22-32 with `<ElevateIcon />` imported from `@/components/icons/elevate-icon`

---

### `src/components/ui/plan-card.tsx` (UPDATE — use extracted ElevateIcon)

- Replace the inline `ElevateIcon` definition at lines 17-32 with import from `@/components/icons/elevate-icon`

---

### `src/components/compte/compte-header.tsx` (UPDATE — use extracted ChevronDownIcon)

- Replace the locally-defined `ChevronDownIcon` with import from `@/components/icons/chevron-down-icon`

---

### `src/components/onboarding/step-merci.tsx` → `src/components/onboarding/step-thank-you.tsx` (RENAME + UPDATE)

- Rename the file from `step-merci.tsx` to `step-thank-you.tsx`
- Rename the exported component from `StepMerci` to `StepThankYou`
- Replace inline App Store and Play Store SVGs with the extracted icon components
- Update all internal imports (store, types — these will already point to new paths from Phase 2)

---

### `src/components/onboarding/onboarding-tabs.tsx` (UPDATE import)

- Update import: `@/components/onboarding/step-merci` → `@/components/onboarding/step-thank-you`
- Update the component reference: `<StepMerci />` → `<StepThankYou />`

---

### `src/components/onboarding/onboarding-form.tsx` (DELETE)

- Delete this file — it is a pointless 1:1 wrapper around `OnboardingTabs`
- The new `app/onboarding/page.tsx` imports `OnboardingTabs` directly

---

### `src/components/ui/field.tsx` (DELETE)

- Delete this file — it is dead code, never imported anywhere

---

### `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg` (DELETE)

- Delete Next.js boilerplate SVGs that are not used anywhere in the codebase
- Verify none are referenced by searching for their filenames in the codebase before deleting

---

### PHASE 5: Bug & Security Fixes

---

### `src/app/api/webhooks/stripe/route.ts` (FIX S3 + FIX B2)

- **FIX S3 — Claims merge:** In `updateSubscriptionStatus`, before calling `setCustomUserClaims`, first read existing claims via `auth.getUser(firebaseUID)`, then merge: `await auth.setCustomUserClaims(firebaseUID, { ...existingClaims, subStatus: { stripe: isActive ? "active" : "inactive" } })`
- **FIX B2 — Missing webhook event:** Add a new `case "invoice.payment_failed"` handler in the switch statement. It should:
  1. Get the invoice object
  2. Get the customer from invoice.customer
  3. Read `firebaseUID` from customer.metadata
  4. Call `updateSubscriptionStatus(firebaseUID, "past_due")`
- Update imports to new paths (`@/lib/config/firebase`, `@/lib/config/stripe`)

---

### `src/app/api/stripe/session-status/route.ts` (FIX S2)

- **FIX S2 — IDOR:** After retrieving the checkout session from Stripe, verify ownership: check that `checkoutSession.metadata?.firebaseUID === session.uid`. If not, return 403 "Accès non autorisé"
- Update imports to new paths

---

### `src/app/layout.tsx` (FIX B3 + FIX B4)

- **FIX B3:** Change `<html lang="en">` to `<html lang="fr">`
- **FIX B4 — Font conflict:** The CSS `globals.css` defines `--font-sans: 'Inter Variable'` but Inter is never loaded. Since the app actually loads Geist, update `globals.css` to use Geist:
  - Change `--font-sans: 'Inter Variable', system-ui, sans-serif` to `--font-sans: var(--font-geist-sans), system-ui, sans-serif`
  - This makes the Tailwind `font-sans` class resolve to the Geist font that is actually loaded

---

### `src/app/globals.css` (FIX B4 — font variable)

- Line 253: Change `--font-sans: 'Inter Variable', system-ui, sans-serif;` to `--font-sans: var(--font-geist-sans), system-ui, sans-serif;`
- This resolves the font conflict by using the CSS variable that next/font sets for Geist

---

### `src/app/api/auth/signup/route.ts` (FIX B5)

- **FIX B5:** Line 47 — Change the error message from `"au moins 6 caractères"` to `"au moins 8 caractères"` to match the Zod validation
- Remove the inline `signupBody` Zod schema; import `signupApiSchema` from `@/lib/validations/auth` instead
- Update imports to new paths

---

### PHASE 6: Update All Imports

These are bulk import path updates across the codebase. Each file needs its import paths updated to match the new locations.

---

### `src/app/api/auth/signup/route.ts`

- `@/lib/auth` → `@/lib/auth/session`
- `@/lib/firebase-admin` → `@/lib/config/firebase`
- Remove inline Zod schema, import from `@/lib/validations/auth`

---

### `src/app/api/auth/login/route.ts`

- `@/lib/auth` → `@/lib/auth/session`
- `@/lib/firebase-admin` → `@/lib/config/firebase`
- `@/lib/validations` → `@/lib/validations/auth`
- Extract subscription check to use `getSubscriptionStatus` from `@/lib/auth/helpers`

---

### `src/app/api/auth/google/route.ts`

- `@/lib/auth` → `@/lib/auth/session`
- `@/lib/firebase-admin` → `@/lib/config/firebase`
- Extract subscription check to use `getSubscriptionStatus` from `@/lib/auth/helpers`

---

### `src/app/api/auth/generate-app-token/route.ts`

- `@/lib/auth` → `@/lib/auth/session`
- `@/lib/firebase-admin` → `@/lib/config/firebase`

---

### `src/app/api/profile/update/route.ts`

- `@/lib/auth` → `@/lib/auth/session`
- `@/lib/firebase-admin` → `@/lib/config/firebase`
- `@/lib/stripe` → `@/lib/config/stripe`
- Remove inline `profileBody` Zod schema, import from `@/lib/validations/profile`

---

### `src/app/api/stripe/prices/route.ts`

- `@/lib/stripe` → `@/lib/config/stripe`

---

### `src/app/api/stripe/create-checkout-session/route.ts`

- `@/lib/auth` → `@/lib/auth/session`
- `@/lib/firebase-admin` → `@/lib/config/firebase`
- `@/lib/stripe` → `@/lib/config/stripe`
- Remove inline `checkoutBody` Zod schema, import from `@/lib/validations/profile`

---

### `src/app/api/stripe/session-status/route.ts`

- `@/lib/auth` → `@/lib/auth/session`
- `@/lib/stripe` → `@/lib/config/stripe`

---

### `src/app/api/stripe/create-portal-session/route.ts`

- `@/lib/auth` → `@/lib/auth/session`
- `@/lib/firebase-admin` → `@/lib/config/firebase`
- `@/lib/stripe` → `@/lib/config/stripe`

---

### `src/app/api/webhooks/stripe/route.ts`

- `@/lib/firebase-admin` → `@/lib/config/firebase`
- `@/lib/stripe` → `@/lib/config/stripe`

---

### `src/components/onboarding/step-credentials.tsx`

- `@/lib/stores/onboarding-store` → `@/stores/onboarding-store`
- `@/lib/validations` → `@/lib/validations/auth`

---

### `src/components/onboarding/step-plan.tsx`

- `@/lib/stores/onboarding-store` → `@/stores/onboarding-store`
- `@/lib/hooks/use-stripe-prices` → `@/hooks/use-stripe-prices`
- `@/lib/types/stripe` → `@/types/stripe`

---

### `src/components/onboarding/step-checkout.tsx`

- `@/lib/stores/onboarding-store` → `@/stores/onboarding-store`

---

### `src/components/onboarding/step-thank-you.tsx` (was step-merci.tsx)

- `@/lib/stores/onboarding-store` → `@/stores/onboarding-store`
- `@/lib/types/stripe` → `@/types/stripe`

---

### `src/hooks/use-stripe-prices.ts` (already moved)

- `@/lib/types/stripe` → `@/types/stripe`

---

### `src/components/auth/login-form.tsx`

- `@/lib/validations` → `@/lib/validations/auth`

---

### PHASE 7: Error Boundary Pages (NEW)

---

### `src/app/not-found.tsx` (NEW)

- Create a simple custom 404 page
- Server component (no "use client" needed)
- Display the Elevate logo, a "Page introuvable" message, and a link to `/onboarding`
- Keep it minimal — follow the visual style of the existing login page (centered layout, dark background)

---

### `src/app/error.tsx` (NEW)

- Create a global error boundary
- Must be a client component (`"use client"`)
- Accept `error` and `reset` props (Next.js convention)
- Display the Elevate logo, a "Une erreur est survenue" message, and a "Réessayer" button calling `reset()`
- Keep minimal styling consistent with existing pages

---

### PHASE 8: Documentation Update

---

### `project-plan.md` (FULL REWRITE of status + structure sections)

- **Status section:** Move all completed items to "Terminé":
  - All 10 implemented API routes (auth/signup, auth/login, auth/google, auth/generate-app-token, profile/update, stripe/prices, stripe/create-checkout-session, stripe/session-status, stripe/create-portal-session, webhooks/stripe)
  - Middleware auth protection
  - Step 3 Checkout (fully implemented, not placeholder)
  - Account pages structure (/compte, profile, facturation)
- **Status section "À faire":** Only keep actually incomplete items:
  - Apple Sign-In API + client
  - Google OAuth client-side wiring
  - Klaviyo integration
  - Account pages with real data (currently mock)
  - Logout endpoint + UI
  - Deep link auto-login wiring in thank-you page
  - `invoice.payment_failed` webhook (add as "now done" if fixed in this PR)
- **Stack section:** Update Next.js 15 → Next.js 16.1.4, `react-international-phone` → `react-phone-number-input`
- **Structure section:** Replace the entire tree with the actual new structure after reorganization
- **Env vars section:** Add `FIREBASE_API_KEY` to the list
- **Route references:** `/onboarding` now exists (correct). Replace `/dashboard` with `/compte` wherever it appears
- **File references:** `lib/jwt.ts` → `lib/auth/session.ts`, `lib/klaviyo.ts` → note as not yet implemented, `components/onboarding/stepper.tsx` → `onboarding-tabs.tsx`, update all component filenames
- Keep the deep link scheme section unchanged (accurate)
- Keep the Stripe configuration section unchanged (accurate)

---

### `CLAUDE.md` (UPDATE route references + env vars)

- **Onboarding Flow section:** Change "The `/onboarding` page manages 4 steps" — this is now correct since we moved the flow to `/onboarding`
- **Authentication Strategy section:** Update "Middleware protects `/onboarding/*` and `/dashboard`" to "Middleware protects `/onboarding/*` and `/compte/*`"
- **Env vars section:** Add `FIREBASE_API_KEY` to the environment variables list with a note that it is the Firebase Web API key used for REST API authentication
- **Project structure note (optional):** Add a brief section describing the new directory structure for lib/, hooks/, stores/, types/
- **API Routes table:** Already accurate, no changes needed

---

### `src/lib/validations.ts` (DELETE after split)

- After `auth.ts` and `profile.ts` are created in `lib/validations/`, delete the original `validations.ts`
- This old path will no longer be imported anywhere

---

### `src/lib/auth.ts` (DELETE after move)

- After `lib/auth/session.ts` is created, delete the original `auth.ts`

---

### `src/lib/firebase-admin.ts` (DELETE after move)

- After `lib/config/firebase.ts` is created, delete the original file

---

### `src/lib/stripe.ts` (DELETE after move)

- After `lib/config/stripe.ts` is created, delete the original file

---

## Testing Strategy

### Automated Verification

- Run `bun lint` after all changes — must pass with zero errors
- Run `bun build` — must succeed (this catches any broken imports or type errors)
- Run `bun dev` and manually test the full onboarding flow:
  1. Visit `/` → should redirect to `/onboarding`
  2. Visit `/signup` → should redirect to `/onboarding`
  3. Complete Step 1 (signup + profile) → verify Firebase user + Stripe customer created
  4. Complete Step 2 (plan selection) → verify prices load from Stripe
  5. Complete Step 3 (checkout) → verify Stripe Embedded Checkout loads
  6. After payment → verify redirect back to `/onboarding?session_id=...` and Step 4 displays
  7. Visit `/login` → login with test credentials → verify redirect to `/compte` (if subscribed) or `/onboarding` (if not)
  8. Visit `/compte` → verify middleware auth protection works
  9. Visit `/onboarding` without auth → verify middleware redirects to `/login`

### Manual Checks

- Verify no console errors in browser dev tools
- Verify all pages render correctly (no visual changes expected)
- Check that 404 page displays when visiting `/nonexistent`
- Check that error boundary works (can be tested by temporarily throwing in a component)

---

## Rollout Considerations

- **No breaking changes** for end users — the `/signup` URL still works (redirects to `/onboarding`)
- **No database migrations needed** — Firestore schema is unchanged
- **No environment variable changes** — all existing env vars still work, `FIREBASE_API_KEY` was already required
- **Stripe return URL changes** — existing checkout sessions with old return URL (`/signup?session_id=...`) will hit the redirect and still work
- **Single PR** — all changes in one commit for atomic deployment. If the build fails, nothing deploys.

---

## Files Summary

| Action | Count | Files |
|--------|-------|-------|
| NEW | 11 | `lib/config/env.ts`, `lib/auth/helpers.ts`, `lib/validations/profile.ts`, `types/user.ts`, `types/api.ts`, `icons/elevate-icon.tsx`, `icons/chevron-down-icon.tsx`, `icons/app-store-icon.tsx`, `icons/play-store-icon.tsx`, `app/not-found.tsx`, `app/error.tsx` |
| MOVE | 7 | `firebase-admin.ts→config/firebase.ts`, `stripe.ts→config/stripe.ts`, `auth.ts→auth/session.ts`, `validations.ts→validations/auth.ts`, `hooks/→top-level`, `stores/→top-level`, `types/→top-level` |
| MOVE+RENAME | 1 | `step-merci.tsx→step-thank-you.tsx` |
| UPDATE imports | 21 | All API routes (10), all onboarding components (5), login-form, use-stripe-prices, middleware, app/page.tsx, onboarding-tabs, login/page.tsx |
| FIX | 6 | `webhooks/stripe` (S3+B2), `session-status` (S2), `layout.tsx` (B3), `globals.css` (B4), `signup/route.ts` (B5), `middleware.ts` (S4) |
| DELETE | 8 | `onboarding-form.tsx`, `field.tsx`, `lib/auth.ts`, `lib/stripe.ts`, `lib/firebase-admin.ts`, `lib/validations.ts`, 5× public SVGs |
| REWRITE | 2 | `project-plan.md`, `signup/page.tsx` (→ redirect) |
| UPDATE docs | 1 | `CLAUDE.md` |
| NEW route | 1 | `app/onboarding/page.tsx` |
