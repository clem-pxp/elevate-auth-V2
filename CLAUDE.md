# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

**Important:** This project uses **Bun** as package manager and runtime. Never use npm/yarn/pnpm.

```bash
bun install      # Install all dependencies
bun dev          # Start development server (port 3000)
bun build        # Build for production
bun start        # Run production server
bun lint         # Run ESLint
bun add <pkg>    # Install dependency
bun add -d <pkg> # Install dev dependency
bun remove <pkg> # Remove dependency
bun run <script> # Run package.json script
```

## Project Overview

Web onboarding tunnel for the Elevate mobile app. Users sign up, complete profile, choose subscription plan, pay via Stripe, then download the app.

**Flow:** Landing → Login → /onboarding (4 steps) → /compte → App

## Tech Stack

- **Framework:** Next.js 16.1.4 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS v4 (design tokens in globals.css)
- **State:** Zustand (onboarding flow), TanStack Query (server state)
- **Forms:** TanStack Form + Zod v4 validation
- **Animations:** Motion (Framer Motion)
- **Backend:** Firebase Admin SDK (auth/users), Stripe (payments)
- **Package Manager:** Bun

## Architecture

### Key Routes

| Route | Purpose |
|-------|---------|
| `/onboarding` | Main onboarding flow (4 steps via Zustand, single page) |
| `/login` | Login page (email/password + Google/Apple buttons) |
| `/signup` | Redirects to `/onboarding` |
| `/compte` | Account area (profile, billing) — French route name |
| `/` | Redirects to `/onboarding` |

### Onboarding Flow (Single Page, 4 Steps)

The `/onboarding` page manages 4 steps via Zustand state (not separate routes):
1. **Credentials** — email, password, firstName, lastName, phone, DOB → Creates Firebase user + Stripe Customer + Firestore
2. **Plan Selection** — Displays Stripe prices dynamically (monthly/quarterly/annual)
3. **Checkout** — Stripe Embedded Checkout
4. **Thank You** — Confirmation + deep links to mobile app stores

### Authentication Strategy

- JWT in httpOnly cookie (2h expiration)
- Firebase Auth methods: Email/Password, Google OAuth, Apple Sign-In
- Middleware protects `/onboarding` and `/compte`
- No client-side auth context — auth is entirely cookie-based
- On login: check `subStatus.stripe` in Firebase Custom Claims → redirect to `/onboarding` or `/compte`

### Project Structure

```
src/
├── app/                        # Next.js App Router pages + API routes
├── components/
│   ├── auth/                   # Login form, OAuth buttons
│   ├── compte/                 # Account area components
│   ├── icons/                  # SVG icon components (extracted)
│   ├── logo/                   # Elevate logo
│   ├── onboarding/             # Step components (credentials, plan, checkout, thank-you)
│   ├── providers/              # React context providers
│   └── ui/                     # Reusable UI primitives (button, input, card, etc.)
├── hooks/                      # Custom React hooks (use-stripe-prices)
├── lib/
│   ├── auth/                   # session.ts (JWT), helpers.ts (subscription check)
│   ├── config/                 # firebase.ts, stripe.ts, env.ts (all server-only)
│   └── validations/            # auth.ts, profile.ts (Zod schemas)
├── stores/                     # Zustand stores (onboarding-store)
├── types/                      # TypeScript types (stripe, user, api)
└── middleware.ts                # Route protection
```

### Import Conventions

- `@/lib/config/firebase` — Firebase Admin SDK (`getAdminAuth`, `getAdminFirestore`)
- `@/lib/config/stripe` — Stripe server SDK (`getStripe`)
- `@/lib/auth/session` — JWT/session management (`signToken`, `setSessionCookie`, `getSessionUser`)
- `@/lib/validations/auth` — Auth schemas (`signupSchema`, `loginSchema`)
- `@/lib/validations/profile` — Profile schemas (`profileSchema`, `checkoutSchema`)
- `@/stores/onboarding-store` — Zustand store
- `@/hooks/use-stripe-prices` — TanStack Query hook
- `@/types/stripe` — Stripe types
- `@/types/user` — User types
- `@/types/api` — API response types

### Firebase ↔ Stripe Mapping

- **Always** create Stripe Customer ourselves with `metadata.firebaseUID`
- Never let Stripe auto-create customer at checkout
- Store `stripeCustomerId` in Firestore `users` collection
- Webhooks update Firestore + Firebase Custom Claims on subscription events (merge, not overwrite)

### Critical Technical Points

1. **Atomic Profile Creation (Step 1):** Stripe Customer first → Firestore save → Klaviyo (non-blocking). If Stripe fails, don't save to Firestore.

2. **Thank You Race Condition:** Webhook may arrive after page display. Use `/api/stripe/session-status` to query Stripe directly (not Firestore) for immediate success display.

3. **Deep Link Auto-Login:** Generate Firebase Custom Token → pass in deep link `elevateapp://auth?token=xxx` → app uses `signInWithCustomToken`

4. **Claims Merge:** Webhook uses spread operator to merge existing claims — never overwrites.

5. **IDOR Protection:** session-status endpoint verifies `metadata.firebaseUID` matches authenticated user.

### Deep Link Scheme

**Production scheme:** `elevateapp`
**Format:** `{scheme}://{path}?{params}`

| Route | Description | Parameters |
|-------|-------------|------------|
| `home` | Home page | — |
| `auth` | Auto-login with custom token | `token` (required) |
| `workout/fitness` | Workout fitness tab | `id` (optional) |
| `nutrition/recipe` | Specific recipe | `id` (required) |
| `profile` | User profile | — |

## Animation Guidelines

Use Motion (Framer Motion) with consistent patterns:
- Spring physics: `stiffness: 300, damping: 30`
- Step transitions use blur + opacity + x-translate via `View` component in `onboarding-tabs.tsx`
- `AnimatePresence` for enter/exit animations
- Plan card selection uses `motion.div` with height animation

## API Routes Reference

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/signup` | POST | Create Firebase Auth user |
| `/api/auth/login` | POST | Verify credentials, return JWT |
| `/api/auth/google` | POST | Google OAuth |
| `/api/auth/apple` | POST | Apple Sign-In (not implemented) |
| `/api/profile/update` | POST | Save profile + create Stripe Customer |
| `/api/stripe/prices` | GET | Get active subscription prices |
| `/api/stripe/create-checkout-session` | POST | Create Embedded Checkout session |
| `/api/stripe/session-status` | GET | Check payment session status |
| `/api/stripe/create-portal-session` | POST | Create Customer Portal session |
| `/api/webhooks/stripe` | POST | Handle Stripe webhook events |
| `/api/auth/generate-app-token` | POST | Generate Firebase Custom Token |

## Environment Variables

```
# Required
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY, FIREBASE_API_KEY
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
JWT_SECRET

# Optional
KLAVIYO_API_KEY
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_DEEP_LINK_SCHEME=elevateapp
NEXT_PUBLIC_APP_STORE_URL=https://apps.apple.com/fr/app/elevate/id6737411142
NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=fr.tryelevate
```

## Path Alias

`@/*` maps to `./src/*` — use for all imports.
