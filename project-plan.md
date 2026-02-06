# Elevate Auth — Project Plan

## Objectif

Tunnel d'onboarding web pour l'app mobile Elevate : inscription, profil, choix d'abonnement, paiement Stripe, puis téléchargement de l'app.

---

## Statut d'avancement

### Terminé

| Composant | Description |
|-----------|-------------|
| **Infrastructure** | Next.js 16.1.4 + React 19 + TypeScript 5 + Tailwind CSS v4 + Bun |
| **Page /onboarding** | Single page avec 4 steps + navigation tabs animée (Zustand) |
| **Step 1: Credentials** | Formulaire complet (Prénom, Nom, Téléphone, Date naissance, Email, Password) |
| **Step 2: Plan Selection** | 3 plans dynamiques depuis Stripe avec PlanCard sélectionnable |
| **Step 3: Checkout** | Stripe Embedded Checkout fonctionnel |
| **Step 4: Thank You** | Confirmation + liens App Store / Play Store + lien compte |
| **Page /login** | Connexion email/password + boutons Google/Apple |
| **Page /signup** | Redirige vers /onboarding (l'inscription se fait au step 1) |
| **Espace /compte** | Layout avec sous-pages profile et facturation (structure, données mock) |
| **API Auth** | signup, login, google, generate-app-token |
| **API Stripe** | prices, create-checkout-session, session-status, create-portal-session |
| **API Profile** | update (crée Stripe Customer + Firestore) |
| **Webhook Stripe** | checkout.session.completed, subscription.updated, subscription.deleted, invoice.payment_failed |
| **Middleware** | Protection des routes /onboarding et /compte (JWT httpOnly cookie) |
| **Composants UI** | Button, Input, Card, DatePicker, PhoneInput, Calendar, Popover, ScrollArea, Command, PlanCard, SocialProofBadge |
| **Zustand Store** | onboarding-store avec gestion état formulaire + navigation steps |
| **Animations** | Transitions fluides entre steps (blur, opacity, x-translate via Motion) |
| **Zod Validations** | signupSchema, loginSchema, profileSchema, checkoutSchema, signupApiSchema |
| **Icons** | ElevateIcon, AppStoreIcon, PlayStoreIcon, ChevronDownIcon, CalendarIcon, CreditCardIcon, UserIcon, ArrowBackIcon |
| **Sécurité** | Claims merge (pas d'écrasement), IDOR protection session-status, `import "server-only"` sur config serveur |
| **Error boundaries** | Pages not-found.tsx et error.tsx |

### A faire

| Composant | Priorité | Description |
|-----------|----------|-------------|
| **Apple Sign-In** | Moyenne | Compléter l'intégration Apple côté serveur |
| **Google OAuth client** | Moyenne | Connecter le bouton Google au flow côté client |
| **Klaviyo** | Basse | Envoi profil marketing au step 1 (non-bloquant) |
| **Logout** | Moyenne | API + bouton de déconnexion |
| **Pages /compte** | Moyenne | Remplacer données mock par données réelles (Firestore + Stripe) |
| **Deep link auto-login** | Basse | Générer custom token + deep link `elevateapp://auth?token=xxx` |
| **Stripe Customer Portal** | Basse | Intégrer sur la page /compte/facturation |

---

## Architecture du Flow

```
Landing Webflow
       ↓
   ┌───────────────────────────────────┐
   │         /login (page)             │  ← Email + Password (ou Google/Apple)
   │              ou                   │
   │      /signup → redirige vers      │
   └───────────────────────────────────┘
                   ↓
   ┌───────────────────────────────────┐
   │     /onboarding (SINGLE PAGE)     │
   │                                   │
   │   Step 1: Credentials + Profil    │  ← Email, Password, Prénom, Nom, Téléphone, DOB
   │               ↓                   │
   │   Step 2: Sélection Plan          │  ← Mensuel / Semestriel / Annuel
   │               ↓                   │
   │   Step 3: Checkout                │  ← Stripe Embedded Checkout
   │               ↓                   │
   │   Step 4: Thank You               │  ← Confirmation + liens stores
   │                                   │
   └───────────────────────────────────┘
                   ↓
              /compte (espace abonné)
                   ↓
              App Mobile (via deep link ou stores)
```

---

## Stack Technique

| Catégorie | Technologie | Version |
|-----------|-------------|---------|
| Framework | Next.js (App Router) | 16.1.4 |
| UI | React | 19 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | v4 |
| State | Zustand | 5 |
| Server state | TanStack Query | 5 |
| Forms | TanStack Form + Zod | v4 |
| Animations | Motion (Framer Motion) | 12 |
| Auth/Users | Firebase Admin SDK | server-side |
| Payments | Stripe (Embedded Checkout + Portal) | — |
| Marketing | Klaviyo API | pas encore intégré |
| Package Manager | Bun | — |

---

## Structure du Projet

```
src/
├── app/
│   ├── layout.tsx                      # Root layout (Inter font, lang="fr")
│   ├── page.tsx                        # Redirect → /onboarding
│   ├── error.tsx                       # Error boundary
│   ├── not-found.tsx                   # 404 page
│   ├── globals.css                     # Design tokens + Tailwind v4
│   ├── onboarding/
│   │   └── page.tsx                    # Single page 4 steps
│   ├── signup/
│   │   └── page.tsx                    # Redirect → /onboarding
│   ├── login/
│   │   └── page.tsx                    # Login page
│   ├── compte/
│   │   ├── layout.tsx                  # Compte layout (header + nav)
│   │   ├── page.tsx                    # Compte home
│   │   ├── profile/page.tsx            # Profile page
│   │   └── facturation/page.tsx        # Billing page
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts
│       │   ├── login/route.ts
│       │   ├── google/route.ts
│       │   └── generate-app-token/route.ts
│       ├── profile/
│       │   └── update/route.ts
│       ├── stripe/
│       │   ├── prices/route.ts
│       │   ├── create-checkout-session/route.ts
│       │   ├── create-portal-session/route.ts
│       │   └── session-status/route.ts
│       └── webhooks/
│           └── stripe/route.ts
├── components/
│   ├── auth/                           # Auth-related components
│   │   ├── login-form.tsx
│   │   ├── google-button.tsx
│   │   └── apple-button.tsx
│   ├── compte/                         # Compte area components
│   │   ├── compte-header.tsx
│   │   └── nav-link.tsx
│   ├── icons/                          # Extracted SVG icon components
│   │   ├── elevate-icon.tsx
│   │   ├── app-store-icon.tsx
│   │   ├── play-store-icon.tsx
│   │   ├── chevron-down-icon.tsx
│   │   ├── arrow-back-icon.tsx
│   │   ├── calendar-icon.tsx
│   │   ├── credit-card-icon.tsx
│   │   └── user-icon.tsx
│   ├── logo/
│   │   └── elevate-logo.tsx
│   ├── onboarding/                     # Onboarding step components
│   │   ├── onboarding-tabs.tsx         # Main tabs + step navigation
│   │   ├── step-credentials.tsx        # Step 1
│   │   ├── step-plan.tsx               # Step 2
│   │   ├── step-plan-skeleton.tsx      # Step 2 loading state
│   │   ├── step-checkout.tsx           # Step 3
│   │   └── step-thank-you.tsx          # Step 4
│   ├── providers/
│   │   └── query-provider.tsx
│   └── ui/                             # Reusable UI components
│       ├── button.tsx
│       ├── input.tsx
│       ├── card.tsx
│       ├── calendar.tsx
│       ├── command.tsx
│       ├── date-picker.tsx
│       ├── phone-input.tsx
│       ├── plan-card.tsx
│       ├── popover.tsx
│       ├── scroll-area.tsx
│       └── social-proof-badge.tsx
├── hooks/
│   └── use-stripe-prices.ts            # TanStack Query hook for Stripe prices
├── lib/
│   ├── auth/
│   │   ├── session.ts                  # JWT sign/verify + session cookie management
│   │   └── helpers.ts                  # Shared auth helpers (getSubscriptionStatus)
│   ├── config/
│   │   ├── firebase.ts                 # Firebase Admin SDK singleton
│   │   ├── stripe.ts                   # Stripe SDK singleton
│   │   └── env.ts                      # Zod env validation
│   ├── validations/
│   │   ├── auth.ts                     # signupSchema, loginSchema, signupApiSchema
│   │   └── profile.ts                  # profileSchema, checkoutSchema
│   ├── stripe-client.ts                # Client-side Stripe (publishable key)
│   └── utils.ts                        # cn() utility
├── stores/
│   └── onboarding-store.ts             # Zustand store (steps, form data)
├── types/
│   ├── stripe.ts                       # Stripe-related types
│   ├── user.ts                         # FirestoreUser, UserCustomClaims
│   └── api.ts                          # API response types
└── middleware.ts                        # Route protection (JWT cookie check)
```

---

## API Routes

| Route | Méthode | Description | Status |
|-------|---------|-------------|--------|
| `/api/auth/signup` | POST | Créer user Firebase Auth + JWT cookie | Done |
| `/api/auth/login` | POST | Vérifier credentials, JWT cookie | Done |
| `/api/auth/google` | POST | Google OAuth (serveur) | Done |
| `/api/auth/apple` | POST | Apple Sign-In | A faire |
| `/api/profile/update` | POST | Profil + Stripe Customer + Firestore | Done |
| `/api/stripe/prices` | GET | Prix actifs depuis Stripe | Done |
| `/api/stripe/create-checkout-session` | POST | Session Stripe Embedded Checkout | Done |
| `/api/stripe/session-status` | GET | Status paiement (avec vérification IDOR) | Done |
| `/api/stripe/create-portal-session` | POST | Customer Portal Stripe | Done |
| `/api/webhooks/stripe` | POST | Events Stripe → Firestore + Claims | Done |
| `/api/auth/generate-app-token` | POST | Firebase Custom Token pour deep link | Done |

---

## Sécurité

| Mesure | Status |
|--------|--------|
| `import "server-only"` sur firebase.ts et stripe.ts | Done |
| Claims merge (pas d'écrasement) dans webhook | Done |
| IDOR protection sur session-status | Done |
| JWT httpOnly cookie (2h) | Done |
| Middleware route protection | Done |
| Zod validation sur inputs API | Partiel |
| Env validation (Zod) | Done |

---

## Variables d'Environnement

```env
# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
FIREBASE_API_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Klaviyo (pas encore utilisé)
KLAVIYO_API_KEY=

# JWT
JWT_SECRET=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEEP_LINK_SCHEME=elevateapp
NEXT_PUBLIC_APP_STORE_URL=https://apps.apple.com/fr/app/elevate/id6737411142
NEXT_PUBLIC_PLAY_STORE_URL=https://play.google.com/store/apps/details?id=fr.tryelevate
```

---

## Firebase

### Auth Methods

- Email/Password (done)
- Google OAuth (server done, client wiring needed)
- Apple Sign-In (not done)

### Custom Claims

```json
{
  "subStatus": {
    "stripe": "active" | "inactive"
  }
}
```

### Firestore Collection `users`

| Champ | Type | Description |
|-------|------|-------------|
| `uid` | string | Firebase Auth UID |
| `email` | string | Email |
| `firstName` | string | Prénom |
| `lastName` | string | Nom |
| `phone` | string | Téléphone (format international) |
| `dateOfBirth` | string | Date de naissance |
| `stripeCustomerId` | string | Stripe Customer ID |
| `subscriptionStatus` | string | active / inactive / canceled / past_due |
| `subscriptionId` | string | Stripe Subscription ID |
| `priceId` | string | Stripe Price ID |
| `currentPeriodEnd` | string | ISO date |
| `createdAt` | string | ISO date |
| `updatedAt` | string | ISO date |

---

## Stripe

### Webhooks écoutés

| Event | Action |
|-------|--------|
| `checkout.session.completed` | Update Firestore + Firebase Custom Claims (merge) |
| `customer.subscription.updated` | Update Firestore subscription status |
| `customer.subscription.deleted` | Update Firestore + Custom Claims → canceled |
| `invoice.payment_failed` | Update Firestore status → past_due |

### Metadata Strategy

Sur Customer et Checkout Session :
- `firebaseUID` : UID Firebase
- `source` : 'web-onboarding'

---

## Deep Link Scheme

**Production scheme :** `elevateapp`
**Format :** `{scheme}://{path}?{params}`

| Route | Description | Paramètres |
|-------|-------------|------------|
| `home` | Page d'accueil | — |
| `auth` | Auto-login avec custom token | `token` (requis) |
| `workout/fitness` | Workout, onglet fitness | `id` (optionnel) |
| `workout/running` | Workout, onglet running | `id` (optionnel) |
| `workout/category` | Catégorie workout | `id` (requis) |
| `workout/program` | Programme workout | `id` (requis) |
| `nutrition` | Section Nutrition | — |
| `nutrition/recipe` | Recette spécifique | `id` (requis) |
| `nutrition/category` | Catégorie nutrition | `id` (requis) |
| `mindset` | Section Mindset | — |
| `mindset/article` | Article spécifique | `id` (requis) |
| `profile` | Profil utilisateur | — |
| `progress` | Progression | — |

**URLs stores :**
- App Store : https://apps.apple.com/fr/app/elevate/id6737411142
- Play Store : https://play.google.com/store/apps/details?id=fr.tryelevate
