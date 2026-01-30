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

**Flow:** Landing → Signup/Login → Onboarding (4 steps) → Dashboard/App

## Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19 + TypeScript 5
- **Styling:** Tailwind CSS v4
- **State:** Zustand (onboarding flow), TanStack Query (server state)
- **Forms:** TanStack Form + Zod validation
- **Animations:** Motion (Framer Motion)
- **Backend:** Firebase Admin SDK (auth/users), Stripe (payments), Klaviyo (marketing)
- **Package Manager:** Bun

## Architecture

### Onboarding Flow (Single Page, 4 Steps)

The `/onboarding` page manages 4 steps via Zustand state (not separate routes):
1. **Profile Form** - firstName, lastName, phone, DOB → Creates Stripe Customer + Firestore user
2. **Plan Selection** - Displays Stripe prices dynamically (monthly/quarterly/annual)
3. **Checkout** - Stripe Embedded Checkout
4. **Thank You** - Confirmation + deep links to mobile app

### Authentication Strategy

- JWT in httpOnly cookie (2h expiration)
- Firebase Auth methods: Email/Password, Google OAuth, Apple Sign-In
- Middleware protects `/onboarding/*` and `/dashboard`
- On login: check `subStatus.stripe` in Firebase Custom Claims → redirect to `/onboarding` or `/dashboard`

### Firebase ↔ Stripe Mapping

- **Always** create Stripe Customer ourselves with `metadata.firebaseUID`
- Never let Stripe auto-create customer at checkout
- Store `stripeCustomerId` in Firestore `users` collection
- Webhooks update Firestore + Firebase Custom Claims on subscription events

### Critical Technical Points

1. **Atomic Profile Creation (Step 1):** Stripe Customer first → Firestore save → Klaviyo (non-blocking). If Stripe fails, don't save to Firestore.

2. **Thank You Race Condition:** Webhook may arrive after page display. Use `/api/stripe/session-status` to query Stripe directly (not Firestore) for immediate success display.

3. **Deep Link Auto-Login:** Generate Firebase Custom Token → pass in deep link `elevateapp://auth?token=xxx` → app uses `signInWithCustomToken`

### Deep Link Scheme

**Production scheme:** `elevateapp`
**iOS URL Name:** `elevateapp.deeplink`
**Format:** `{scheme}://{path}?{params}`

| Route | Description | Parameters |
|-------|-------------|------------|
| `home` | Home page | — |
| `mealplan` | Meal plan (redirects to onboarding if incomplete) | — |
| `community` | Community section | — |
| `workout` or `workout/fitness` | Workout fitness tab | `id` (optional) |
| `workout/running` | Workout running tab | `id` (optional) |
| `workout/category` | Workout category | `id` (required) |
| `workout/program` | Workout program | `id` (required) |
| `nutrition` | Nutrition section | — |
| `nutrition/recipe` | Specific recipe | `id` (required) |
| `nutrition/category` | Nutrition category | `id` (required) |
| `mindset` | Mindset section | — |
| `mindset/article` | Specific article | `id` (required) |
| `profile` | User profile | — |
| `progress` | User progress | — |
| `settings/connected-applications` | Connected apps (Terra, etc.) | — |
| `auth` | Auto-login with custom token | `token` (required) |

**Examples:**
- `elevateapp://workout/fitness?id=abc123`
- `elevateapp://nutrition/recipe?id=xyz789`
- `elevateapp://home`
- `elevateapp://auth?token=xxx`

### signInWithCustomToken (Admin Impersonation)

The app supports `signInWithCustomToken` for admin debugging/impersonation (SUPERADMIN only). Flow:
1. Admin generates a custom token via the back-office (admin panel)
2. Token is copied and pasted into the mobile app (dev tools)
3. App uses `signInWithCustomToken` from Firebase to authenticate as that user

This is separate from the web onboarding deep link auto-login flow, which also uses custom tokens but generates them automatically via `/api/auth/generate-app-token`.

## Animation Guidelines

Use Motion (Framer Motion) with consistent patterns:

### Step Transitions
```tsx
<AnimatePresence mode="wait">
  <motion.div
    key={currentStep}
    initial={{ opacity: 0, x: 50 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -50 }}
    transition={{ type: "spring", stiffness: 300, damping: 30 }}
  >
    {/* Step content */}
  </motion.div>
</AnimatePresence>
```

### Micro-interactions
- Plan card hover/selection states
- Button loading spinners
- Success animation on Thank You page
- Use spring physics for natural feel

## Performance Priorities

- React Compiler enabled (`reactCompiler: true` in next.config.ts)
- Fetch Stripe prices once, cache with TanStack Query
- Minimize bundle size - lazy load checkout components
- Optimize images via Next.js Image component

## API Routes Reference

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/auth/signup` | POST | Create Firebase Auth user |
| `/api/auth/login` | POST | Verify credentials, return JWT |
| `/api/auth/google` | POST | Google OAuth |
| `/api/auth/apple` | POST | Apple Sign-In |
| `/api/profile/update` | POST | Save profile + create Stripe Customer |
| `/api/stripe/prices` | GET | Get active subscription prices |
| `/api/stripe/create-checkout-session` | POST | Create Embedded Checkout session |
| `/api/stripe/session-status` | GET | Check payment session status |
| `/api/stripe/create-portal-session` | POST | Create Customer Portal session |
| `/api/webhooks/stripe` | POST | Handle Stripe webhook events |
| `/api/auth/generate-app-token` | POST | Generate Firebase Custom Token |

## Environment Variables

```
FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
KLAVIYO_API_KEY
JWT_SECRET
NEXT_PUBLIC_APP_URL
NEXT_PUBLIC_DEEP_LINK_SCHEME=elevateapp
NEXT_PUBLIC_APP_STORE_URL=https://apps.apple.com/fr/app/elevate/id6737411142
NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=fr.tryelevate
```

## Path Alias

`@/*` maps to `./src/*` - use for all imports.
