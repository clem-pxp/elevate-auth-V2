# Task: Codebase Reorganization & Analysis

## Executive Summary

The Elevate Auth project is a Next.js 16 onboarding tunnel for the Elevate mobile app. The core flow (signup → profile → plan selection → Stripe checkout → thank you) is **functional** but the codebase has significant organizational issues, outdated documentation, incomplete features, and several bugs that need attention.

**Current completion: ~65%** — The happy path works end-to-end, but OAuth, account pages, deep links, Klaviyo, and several edge cases remain incomplete.

---

## 1. Current File Structure (As-Is)

```
src/
├── middleware.ts                          # JWT auth middleware
├── app/
│   ├── globals.css                       # Tailwind v4 theme + design tokens
│   ├── layout.tsx                        # Root layout (fonts, QueryProvider)
│   ├── page.tsx                          # Redirects → /signup
│   ├── favicon.ico
│   ├── login/page.tsx                    # Login page
│   ├── signup/page.tsx                   # ⚠️ Actually the FULL onboarding flow (not just signup)
│   ├── compte/                           # 🇫🇷 French naming (account area)
│   │   ├── layout.tsx                    # Account layout with sidebar
│   │   ├── page.tsx                      # Redirects → /compte/profile
│   │   ├── profile/page.tsx             # ⚠️ Hardcoded mock data
│   │   └── facturation/page.tsx         # ⚠️ Hardcoded mock data
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts           # ✅ Firebase Auth create user
│       │   ├── login/route.ts            # ✅ Firebase REST auth + sub check
│       │   ├── google/route.ts           # ✅ Google OAuth API (no client wiring)
│       │   └── generate-app-token/route.ts # ✅ Firebase custom token
│       ├── profile/update/route.ts       # ✅ Profile + Stripe Customer
│       ├── stripe/
│       │   ├── prices/route.ts           # ✅ List Stripe prices
│       │   ├── create-checkout-session/route.ts # ✅ Embedded checkout
│       │   ├── session-status/route.ts   # ✅ Check payment status
│       │   └── create-portal-session/route.ts # ✅ Customer Portal
│       └── webhooks/stripe/route.ts      # ⚠️ Partial (missing invoice.payment_failed)
├── components/
│   ├── auth/
│   │   ├── login-form.tsx                # Login form (TanStack Form)
│   │   ├── google-button.tsx             # ⚠️ UI only, onClick not wired
│   │   └── apple-button.tsx              # ⚠️ UI only, onClick not wired
│   ├── compte/
│   │   ├── compte-header.tsx             # ⚠️ Hardcoded "Clement" user name
│   │   └── nav-link.tsx                  # Sidebar nav link
│   ├── icons/
│   │   ├── arrow-back-icon.tsx
│   │   ├── calendar-icon.tsx
│   │   ├── credit-card-icon.tsx
│   │   └── user-icon.tsx
│   ├── logo/elevate-logo.tsx             # Full "elevate" text logo
│   ├── onboarding/
│   │   ├── onboarding-form.tsx           # ⚠️ Pointless wrapper → just renders OnboardingTabs
│   │   ├── onboarding-tabs.tsx           # Main 4-step orchestrator (247 lines)
│   │   ├── step-credentials.tsx          # Step 1: signup + profile form
│   │   ├── step-plan.tsx                 # Step 2: plan selection
│   │   ├── step-plan-skeleton.tsx        # Loading skeleton
│   │   ├── step-checkout.tsx             # Step 3: Stripe Embedded Checkout
│   │   └── step-merci.tsx                # Step 4: thank you (🇫🇷 French name)
│   ├── providers/query-provider.tsx      # TanStack Query provider
│   └── ui/
│       ├── button.tsx                    # Button variants
│       ├── card.tsx                      # ⚠️ Uses string concat instead of cn()
│       ├── input.tsx                     # ⚠️ Uses string concat instead of cn()
│       ├── field.tsx                     # ⚠️ DEAD CODE — never imported
│       ├── calendar.tsx                  # react-day-picker wrapper
│       ├── date-picker.tsx               # Date picker + popover
│       ├── popover.tsx                   # Radix popover wrapper
│       ├── command.tsx                   # cmdk wrapper
│       ├── scroll-area.tsx               # Radix scroll area
│       ├── phone-input.tsx               # International phone input (316 lines)
│       ├── plan-card.tsx                 # Plan selection card
│       └── social-proof-badge.tsx        # ⚠️ Uses <img> instead of <Image>
└── lib/
    ├── auth.ts                           # JWT sign/verify + session cookies
    ├── firebase-admin.ts                 # Firebase Admin singleton
    ├── stripe.ts                         # ⚠️ Missing "server-only" import
    ├── stripe-client.ts                  # Stripe.js client singleton
    ├── utils.ts                          # cn() utility
    ├── validations.ts                    # Zod schemas
    ├── hooks/use-stripe-prices.ts        # TanStack Query hook
    ├── stores/onboarding-store.ts        # Zustand store
    └── types/stripe.ts                   # Stripe types only
```

---

## 2. Critical Issues Found

### 2.1 Security Issues

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| S1 | 🔴 High | `src/lib/stripe.ts` | Missing `import "server-only"`. Stripe secret key could leak to client bundle. |
| S2 | 🔴 High | `src/app/api/stripe/session-status/route.ts` | No ownership verification — any authenticated user can check any session ID (IDOR). |
| S3 | 🔴 High | `src/app/api/webhooks/stripe/route.ts:39-41` | `setCustomUserClaims` replaces ALL claims instead of merging. Wipes existing claims like `roles`. |
| S4 | 🟡 Medium | `src/middleware.ts:4` | Protects `/onboarding` (doesn't exist) but NOT `/signup` (the actual onboarding flow). |
| S5 | 🟡 Medium | Multiple API routes | No rate limiting on any endpoint. |

### 2.2 Bugs

| # | Severity | Location | Issue |
|---|----------|----------|-------|
| B1 | 🔴 High | `step-credentials.tsx:48-87` | Race condition: if signup succeeds but profile/update fails, user has Firebase account with no Stripe customer. Cannot re-signup (email exists). No recovery mechanism. |
| B2 | 🔴 High | `webhooks/stripe/route.ts` | Missing `invoice.payment_failed` handler — users with failed payments keep active status. |
| B3 | 🟡 Medium | `layout.tsx:29` | `<html lang="en">` but entire app is in French. Should be `lang="fr"`. |
| B4 | 🟡 Medium | `layout.tsx` + `globals.css` | Font conflict: loads Geist fonts but CSS `--font-sans` points to 'Inter Variable' (never loaded). |
| B5 | 🟡 Medium | `signup/route.ts:48` vs `validations.ts:21` | Password error says "6 caractères" but validation requires 8. |

### 2.3 Naming & Organization Issues

| # | Issue | Details |
|---|-------|---------|
| N1 | French/English route mix | `/compte`, `/compte/facturation` (FR) vs `/login`, `/signup` (EN) |
| N2 | French/English component mix | `step-merci.tsx` (FR) vs `step-credentials.tsx`, `step-checkout.tsx` (EN) |
| N3 | Misleading route name | `/signup` is actually the full 4-step onboarding flow, not just signup |
| N4 | Flat lib directory | `hooks/`, `stores/`, `types/` buried under `lib/` instead of top-level |
| N5 | Inconsistent className patterns | Some files use `cn()`, others use template literals (`card.tsx`, `input.tsx`, `nav-link.tsx`) |
| N6 | Duplicated Zod schemas | Signup route, profile/update route, and `validations.ts` each define their own schemas |
| N7 | Duplicated SVG icons | Elevate "e" icon appears inline in 3 places: `login/page.tsx`, `plan-card.tsx`, and as a separate component |

### 2.4 Dead Code & Unused Files

| File | Issue |
|------|-------|
| `src/components/ui/field.tsx` | Never imported anywhere |
| `src/components/onboarding/onboarding-form.tsx` | Pointless 1:1 wrapper around OnboardingTabs |
| `src/lib/auth.ts:34` (`clearSessionCookie`) | Defined but never called (no logout) |
| `public/file.svg, globe.svg, next.svg, vercel.svg, window.svg` | Next.js boilerplate, likely unused |

---

## 3. Code Duplication Inventory

| Pattern | Occurrences | Files |
|---------|-------------|-------|
| Subscription status check | 2x | `login/route.ts:75-78`, `google/route.ts:62-65` |
| Session auth guard boilerplate | 5x | All protected API routes repeat same 3-line pattern |
| Zod validation + error extraction | 5x | Each API route inlines its own |
| `getSecret()` function | 2x | `auth.ts:7-9`, `middleware.ts:6-8` |
| InfoRow component | 2x | `profile/page.tsx`, `facturation/page.tsx` (slightly different signatures) |
| Elevate "e" icon SVG | 3x | `login/page.tsx`, `plan-card.tsx`, inline in each |
| GoogleButton / AppleButton structure | 2x | Identical except icon and text |

---

## 4. Feature Completion Matrix

### API Routes

| Route | Planned | Implemented | Issues |
|-------|---------|-------------|--------|
| `/api/auth/signup` | ✅ | ✅ | Works. Own Zod schema (not shared). |
| `/api/auth/login` | ✅ | ✅ | Works. Undocumented `FIREBASE_API_KEY` dependency. |
| `/api/auth/google` | ✅ | ✅ API only | No client-side Google SDK integration. |
| `/api/auth/apple` | ✅ | ❌ | **Not implemented at all.** |
| `/api/profile/update` | ✅ | ✅ | Works. Missing Klaviyo step, missing `source` field. |
| `/api/stripe/prices` | ✅ | ✅ | Works. No caching headers. |
| `/api/stripe/create-checkout-session` | ✅ | ✅ | Works. Missing `source` metadata. |
| `/api/stripe/session-status` | ✅ | ✅ | Works. Missing ownership check (IDOR). |
| `/api/stripe/create-portal-session` | ✅ | ✅ | Works. Not wired to any UI. |
| `/api/webhooks/stripe` | ✅ | ⚠️ Partial | Missing `invoice.payment_failed`. Claims overwrite bug. |
| `/api/auth/generate-app-token` | ✅ | ✅ | Works. Never called from frontend. |

### Frontend Features

| Feature | Status | Notes |
|---------|--------|-------|
| Signup form (Step 1) | ✅ Done | Combined signup + profile |
| Plan selection (Step 2) | ✅ Done | Dynamic Stripe prices |
| Stripe Checkout (Step 3) | ✅ Done | Embedded checkout works |
| Thank You (Step 4) | ⚠️ Partial | No deep link auto-login, no subscription recap |
| Login page | ⚠️ Partial | Form works, OAuth buttons are non-functional |
| Google OAuth | ❌ Not wired | Button exists, API exists, no Google SDK integration |
| Apple Sign-In | ❌ Not started | Button exists, no API route, no Apple SDK |
| Account profile page | ⚠️ Mock only | All hardcoded data, no API calls |
| Account billing page | ⚠️ Mock only | All hardcoded, "Gerer mon abonnement" button does nothing |
| Logout | ❌ None | No logout endpoint, no UI, `clearSessionCookie` unused |
| Klaviyo integration | ❌ None | No library, no code, no API calls |
| Deep link auto-login | ❌ Not wired | API exists but never called from step-merci.tsx |
| Landing page | ❌ None | Root `/` just redirects to `/signup` |
| Error/404 pages | ❌ None | No `error.tsx`, `not-found.tsx`, `loading.tsx` |

---

## 5. Documentation vs Reality

### CLAUDE.md Mismatches

| CLAUDE.md says | Reality |
|----------------|---------|
| Onboarding lives at `/onboarding` | Lives at `/signup` |
| Middleware protects `/onboarding/*` and `/dashboard` | Protects `/onboarding` (doesn't exist) and `/compte` |
| JWT contains `firebaseUID`, `stripeCustomerId`, `email` | Only contains `uid` |
| `subStatus.stripe = true` (boolean) | Code uses `"active"/"inactive"` (strings) |

### project-plan.md Mismatches

| project-plan.md says | Reality |
|----------------------|---------|
| Status section: many items marked "En cours / À faire" | Most are actually done |
| Stack: Next.js 15 | Actually Next.js 16.1.4 |
| Stack: `react-international-phone` | Actually `react-phone-number-input` |
| Route: `/onboarding` | Doesn't exist, flow is at `/signup` |
| Route: `/dashboard` | Doesn't exist, replaced by `/compte` |
| File: `lib/jwt.ts` | Actually `lib/auth.ts` |
| File: `lib/klaviyo.ts` | Doesn't exist |
| File: `components/onboarding/stepper.tsx` | Actually `onboarding-tabs.tsx` |
| Folder: `src/stores/` | Actually `src/lib/stores/` |
| Folder: `src/hooks/` | Actually `src/lib/hooks/` |
| Folder: `src/types/` | Actually `src/lib/types/` |
| Env: `FIREBASE_API_KEY` | Required but not documented |

---

## 6. Proposed Reorganized Structure

Based on Next.js App Router best practices (feature-based architecture):

```
src/
├── middleware.ts
├── app/
│   ├── globals.css
│   ├── layout.tsx
│   ├── not-found.tsx                          # NEW: Custom 404
│   ├── error.tsx                              # NEW: Global error boundary
│   ├── page.tsx                               # Landing redirect
│   ├── (auth)/                                # Route group (no URL impact)
│   │   ├── login/page.tsx
│   │   └── signup/page.tsx                    # Renamed from old signup → onboarding entry
│   ├── onboarding/                            # NEW: Move onboarding here (matches docs)
│   │   └── page.tsx                           # 4-step flow (currently at /signup)
│   ├── compte/                                # Keep French (user-facing URL)
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── profile/page.tsx
│   │   └── facturation/page.tsx
│   └── api/                                   # Keep as-is (well organized)
│       ├── auth/
│       │   ├── signup/route.ts
│       │   ├── login/route.ts
│       │   ├── logout/route.ts                # NEW
│       │   ├── google/route.ts
│       │   ├── apple/route.ts                 # NEW
│       │   └── generate-app-token/route.ts
│       ├── profile/update/route.ts
│       ├── stripe/
│       │   ├── prices/route.ts
│       │   ├── create-checkout-session/route.ts
│       │   ├── session-status/route.ts
│       │   └── create-portal-session/route.ts
│       └── webhooks/stripe/route.ts
├── components/
│   ├── ui/                                    # Keep: Generic UI primitives
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── calendar.tsx
│   │   ├── date-picker.tsx
│   │   ├── popover.tsx
│   │   ├── command.tsx
│   │   ├── scroll-area.tsx
│   │   ├── phone-input.tsx
│   │   ├── plan-card.tsx
│   │   ├── social-proof-badge.tsx
│   │   ├── info-row.tsx                       # NEW: Extract from profile/facturation
│   │   └── status-badge.tsx                   # NEW: Extract from facturation
│   ├── icons/                                 # Keep + consolidate
│   │   ├── arrow-back-icon.tsx
│   │   ├── calendar-icon.tsx
│   │   ├── credit-card-icon.tsx
│   │   ├── user-icon.tsx
│   │   ├── elevate-icon.tsx                   # NEW: Extract the "e" icon (deduplicate)
│   │   ├── chevron-down-icon.tsx              # NEW: Extract from compte-header.tsx
│   │   ├── app-store-icon.tsx                 # NEW: Extract from step-merci.tsx
│   │   └── play-store-icon.tsx                # NEW: Extract from step-merci.tsx
│   ├── logo/elevate-logo.tsx                  # Keep
│   ├── providers/query-provider.tsx           # Keep
│   ├── auth/                                  # Keep
│   │   ├── login-form.tsx
│   │   ├── google-button.tsx
│   │   └── apple-button.tsx
│   ├── onboarding/                            # Keep (remove pointless wrapper)
│   │   ├── onboarding-tabs.tsx                # Main orchestrator
│   │   ├── step-credentials.tsx               # Step 1
│   │   ├── step-plan.tsx                      # Step 2
│   │   ├── step-plan-skeleton.tsx
│   │   ├── step-checkout.tsx                  # Step 3
│   │   └── step-thank-you.tsx                 # Step 4 (renamed from step-merci)
│   └── compte/                                # Keep
│       ├── compte-header.tsx
│       └── nav-link.tsx
├── lib/
│   ├── config/                                # NEW: Centralized config
│   │   ├── env.ts                             # NEW: Env var validation (Zod)
│   │   ├── firebase.ts                        # Renamed from firebase-admin.ts
│   │   └── stripe.ts                          # Server-side Stripe (add server-only)
│   ├── auth/                                  # NEW: Auth utilities grouped
│   │   ├── session.ts                         # JWT sign/verify + cookies (from auth.ts)
│   │   └── helpers.ts                         # NEW: Shared auth logic (sub check, etc.)
│   ├── stripe-client.ts                       # Keep: Client-side Stripe.js
│   ├── utils.ts                               # Keep: cn() utility
│   └── validations/                            # NEW: Split by domain
│       ├── auth.ts                            # Signup + login schemas
│       └── profile.ts                         # Profile update schema
├── hooks/                                      # MOVE from lib/hooks/ → top-level
│   └── use-stripe-prices.ts
├── stores/                                     # MOVE from lib/stores/ → top-level
│   └── onboarding-store.ts
└── types/                                      # MOVE from lib/types/ → top-level
    ├── stripe.ts
    ├── user.ts                                # NEW: User/profile types
    └── api.ts                                 # NEW: Shared API response types
```

### Key Changes Summary

1. **Move onboarding flow** from `/signup` to `/onboarding` (matches all documentation)
2. **Create route group** `(auth)` for login/signup pages
3. **Move `hooks/`, `stores/`, `types/`** to top-level `src/` (standard convention)
4. **Group lib files** into `config/`, `auth/`, `validations/` subdirectories
5. **Extract duplicated SVGs** into icon components
6. **Remove dead code** (`field.tsx`, `onboarding-form.tsx`)
7. **Rename** `step-merci.tsx` → `step-thank-you.tsx` (consistent English naming)
8. **Add** `not-found.tsx`, `error.tsx` (Next.js conventions)
9. **Add** `logout` API route, `apple` API route
10. **Extract** shared `InfoRow`, `StatusBadge` components

---

## 7. Patterns to Follow

### Existing Good Patterns
- Zustand for flow state + TanStack Query for server state — well separated
- `import "server-only"` in `firebase-admin.ts` — replicate in `stripe.ts`
- Lazy SDK initialization (both Stripe server and client) — prevents build crashes
- Spring-based animations for step transitions — smooth UX
- `useCallback` for Stripe `fetchClientSecret` — prevents re-renders

### Patterns to Fix
- `cn()` utility should be used everywhere (not template literals)
- API routes should use shared auth guard helper
- API routes should import shared Zod schemas (not define inline)
- All SVG icons should be component files (not inline JSX)
- `forwardRef` is unnecessary in React 19 — can be removed gradually

---

## 8. Recommended Priority Order

### Phase 1: Critical Fixes (No feature changes)
1. Fix `setCustomUserClaims` to merge (not replace) existing claims
2. Add `import "server-only"` to `lib/stripe.ts`
3. Add session ownership check to `/api/stripe/session-status`
4. Fix `<html lang="fr">`
5. Fix font conflict (remove Inter Variable from CSS or load it)
6. Fix password length error message inconsistency

### Phase 2: Reorganization (This task)
1. Move onboarding flow to `/onboarding` route
2. Update middleware to protect correct routes
3. Move `hooks/`, `stores/`, `types/` to top-level
4. Group lib files into subdirectories
5. Extract duplicated code (schemas, SVGs, auth helpers, InfoRow)
6. Remove dead code
7. Rename `step-merci.tsx` → `step-thank-you.tsx`

### Phase 3: Documentation Update
1. Update `project-plan.md` status section (most items are done)
2. Update `project-plan.md` structure section to match reality
3. Update `CLAUDE.md` route references
4. Document `FIREBASE_API_KEY` env var requirement
5. Update tech stack versions

### Phase 4: Complete Missing Features
1. Implement logout (`/api/auth/logout` + UI)
2. Wire Google OAuth client-side
3. Implement Apple Sign-In (API + client)
4. Wire account pages to real data (remove mock data)
5. Wire "Gerer mon abonnement" to Customer Portal API
6. Implement deep link auto-login on thank you page
7. Add `invoice.payment_failed` webhook handler
8. Implement Klaviyo integration

---

## 9. Dependencies & External Services

| Service | SDK | Status |
|---------|-----|--------|
| Firebase Auth | `firebase-admin@13.6.0` | ✅ Working (server-side) |
| Firestore | `firebase-admin@13.6.0` | ✅ Working |
| Stripe Payments | `stripe@20.3.0` | ✅ Working |
| Stripe Checkout (Client) | `@stripe/react-stripe-js@5.6.0` | ✅ Working |
| Klaviyo | Not installed | ❌ Not started |
| Google OAuth | Firebase REST API | ⚠️ API only, no client SDK |
| Apple Sign-In | None | ❌ Not started |

---

## 10. Environment Variables Audit

| Variable | Documented | Required | Used |
|----------|-----------|----------|------|
| `FIREBASE_PROJECT_ID` | ✅ CLAUDE.md + plan | ✅ | ✅ firebase-admin.ts |
| `FIREBASE_CLIENT_EMAIL` | ✅ | ✅ | ✅ firebase-admin.ts |
| `FIREBASE_PRIVATE_KEY` | ✅ | ✅ | ✅ firebase-admin.ts |
| `FIREBASE_API_KEY` | ❌ **NOT DOCUMENTED** | ✅ | ✅ login/route.ts, google/route.ts |
| `STRIPE_SECRET_KEY` | ✅ | ✅ | ✅ stripe.ts |
| `STRIPE_WEBHOOK_SECRET` | ✅ | ✅ | ✅ webhooks/stripe/route.ts |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | ✅ | ✅ | ✅ stripe-client.ts |
| `KLAVIYO_API_KEY` | ✅ | ❌ (not used) | ❌ No code |
| `JWT_SECRET` | ✅ | ✅ | ✅ auth.ts, middleware.ts |
| `NEXT_PUBLIC_APP_URL` | ✅ | ✅ | ✅ Multiple routes |
| `NEXT_PUBLIC_DEEP_LINK_SCHEME` | ✅ | ⚠️ | ✅ generate-app-token |
| `NEXT_PUBLIC_APP_STORE_URL` | ✅ | ⚠️ | ✅ step-merci.tsx |
| `NEXT_PUBLIC_PLAY_STORE_URL` | ✅ | ⚠️ | ✅ step-merci.tsx |
