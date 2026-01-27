# Elevate Auth — Project Plan

## Objectif

Développer un tunnel d'onboarding web pour l'app mobile Elevate permettant aux utilisateurs de s'inscrire, compléter leur profil, choisir un plan et payer via Stripe avant de télécharger l'app.

---

## 📊 Statut d'avancement

### ✅ Terminé

| Composant | Description |
|-----------|-------------|
| **Infrastructure de base** | Next.js 16 + React 19 + TypeScript + Tailwind CSS v4 |
| **Page /signup** | Page de création de compte (placeholder) |
| **Page /login** | Page de connexion avec formulaire |
| **Page /onboarding** | Single page avec 4 steps + navigation tabs animée |
| **Composants UI** | Button, Input, Card, DatePicker, PhoneInput, Popover, ScrollArea, Command |
| **Step 1: Credentials** | Formulaire complet (Prénom, Nom, Téléphone, Date naissance, Email, Password) |
| **Step 2: Plan Selection** | Affichage des 3 plans avec PlanCard sélectionnable |
| **Step 4: Thank You** | Page Merci avec liens App Store / Play Store + lien dashboard |
| **Zustand Store** | onboarding-store.ts avec gestion état formulaire + navigation steps |
| **Animations** | Transitions fluides entre steps avec Motion (blur, opacity, x-translate) |
| **Zod Validations** | Schéma signupSchema pour validation formulaire |
| **Espace Compte** | Layout /compte avec sous-pages profile et facturation (structure) |

### 🚧 En cours / À faire

| Composant | Priorité | Description |
|-----------|----------|-------------|
| **Step 3: Checkout** | 🔴 Haute | Stripe Embedded Checkout (placeholder actuellement) |
| **API /api/auth/signup** | 🔴 Haute | Créer user Firebase Auth |
| **API /api/auth/login** | 🔴 Haute | Vérifier credentials, retourner JWT |
| **API /api/profile/update** | 🔴 Haute | Sauvegarder profil + créer Stripe Customer |
| **API /api/stripe/prices** | 🟡 Moyenne | Récupérer les prix Stripe dynamiquement |
| **API /api/stripe/create-checkout-session** | 🔴 Haute | Créer session Stripe Embedded Checkout |
| **API /api/stripe/session-status** | 🟡 Moyenne | Vérifier status paiement |
| **API /api/webhooks/stripe** | 🔴 Haute | Gérer events Stripe + update Firestore/Claims |
| **Middleware auth** | 🔴 Haute | Protection routes /onboarding et /dashboard |
| **Google OAuth** | 🟡 Moyenne | Auth via Google |
| **Apple Sign-In** | 🟡 Moyenne | Auth via Apple |
| **API /api/stripe/create-portal-session** | 🟢 Basse | Customer Portal pour /dashboard |
| **API /api/auth/generate-app-token** | 🟢 Basse | Firebase Custom Token pour deep link |
| **Klaviyo integration** | 🟢 Basse | Envoi profil marketing |

### 📝 Changements par rapport au plan initial

1. **Phone Input** : Utilisation de `react-phone-number-input` au lieu de `react-international-phone` (mentionné dans le plan). Le composant PhoneInput est un composant custom avec sélecteur de pays dropdown, recherche de pays, et format international.

2. **Structure Steps** : Le Step 1 combine le formulaire profil ET le signup (email/password) en une seule étape au lieu de séparer signup et onboarding.

3. **Compte pages** : Ajout des pages `/compte`, `/compte/profile`, `/compte/facturation` (structure dashboard alternative).

---

## Architecture du Flow

```
Landing Webflow
       ↓
   ┌───────────────────────────────────┐
   │         /signup (page)            │  ← Email + Password (ou Google/Apple)
   │              ou                   │
   │         /login (page)             │  ← Email + Password (ou Google/Apple)
   └───────────────────────────────────┘
                   ↓
   ┌───────────────────────────────────┐
   │     /onboarding (SINGLE PAGE)     │
   │                                   │
   │   Step 1: Formulaire Profil       │  ← Prénom, Nom, Téléphone, Date de naissance
   │               ↓                   │
   │   Step 2: Sélection Plan          │  ← Mensuel / Semestriel / Annuel
   │               ↓                   │
   │   Step 3: Checkout                │  ← Stripe Embedded Checkout
   │               ↓                   │
   │   Step 4: Thank You               │  ← Confirmation + Deep Links
   │                                   │
   └───────────────────────────────────┘
                   ↓
              /dashboard (si déjà abonné)
                   ↓
              App Mobile (via deep link)
```

---

## Stack Technique

| Catégorie | Technologie |
| --- | --- |
| Framework | Next.js 15 (App Router) |
| Data Fetching | TanStack Query |
| Forms | TanStack Form + Zod |
| State Management | Zustand |
| Styling | Tailwind CSS |
| Animations | Motion (Framer Motion) |
| Auth/Users | Firebase Admin SDK (server-side) |
| Payments | Stripe (Embedded Checkout + Customer Portal) |
| Marketing | Klaviyo API |
| Date Utils | date-fns |
| Phone Input | react-international-phone |

---

## Pages à Développer

### /signup

Création de compte avec 3 méthodes d'authentification :
- Email + Password
- Google OAuth
- Apple Sign-In

Après signup réussi → redirection vers `/onboarding`

### /login

Connexion avec les mêmes 3 méthodes (tabs ou boutons) :
- Email + Password
- Google OAuth  
- Apple Sign-In

Après login :
- Si pas abonné → `/onboarding`
- Si déjà abonné (`subStatus.stripe === true`) → `/dashboard`

### /onboarding (Single Page - 4 Steps)

**Architecture :** Une seule page Next.js avec 4 steps gérés par Zustand. Pas de routes séparées.

**Animations :** Transitions fluides entre steps avec Framer Motion (AnimatePresence mode="wait").

#### Step 1: Formulaire Profil

Champs à collecter :
- Prénom (required)
- Nom (required)
- Téléphone (required, format international)
- Date de naissance (required)

Actions au submit :
1. Créer Stripe Customer avec `metadata.firebaseUID`
2. Sauvegarder dans Firestore collection `users`
3. Envoyer profil à Klaviyo
4. Passer au step 2

#### Step 2: Sélection du Plan

Afficher 3 plans avec toggle ou cards :

| Plan | Intervalle | Prix |
| --- | --- | --- |
| Mensuel | 1 mois | 19,00€ |
| Semestriel | 6 mois | 89,94€ |
| Annuel | 12 mois | 143,88€ |

Prix récupérés dynamiquement depuis Stripe API.

#### Step 3: Checkout

Stripe Embedded Checkout avec :
- `customer` : le Stripe Customer ID créé au step 1
- `mode` : subscription
- `price` : le price ID sélectionné au step 2
- `metadata` : { firebaseUID, source: 'web-onboarding' }

#### Step 4: Thank You

Contenu :
- Message de succès
- Récap de l'abonnement
- Deep link "Ouvrir l'app" (avec auto-login)
- Liens App Store / Play Store
- Lien vers `/dashboard`

### /dashboard (Espace Abonné)

Pour les utilisateurs déjà abonnés :
- Infos sur l'abonnement actuel
- Bouton "Gérer mon abonnement" → Stripe Customer Portal
- Deep links vers l'app
- Liens stores

---

## API Routes

| Route | Méthode | Description |
| --- | --- | --- |
| `/api/auth/signup` | POST | Créer user Firebase Auth |
| `/api/auth/login` | POST | Vérifier credentials, retourner JWT |
| `/api/auth/google` | POST | Auth via Google OAuth |
| `/api/auth/apple` | POST | Auth via Apple Sign-In |
| `/api/profile/update` | POST | Sauvegarder profil + créer Stripe Customer |
| `/api/stripe/prices` | GET | Récupérer les prix actifs |
| `/api/stripe/create-checkout-session` | POST | Créer Checkout Session |
| `/api/stripe/session-status` | GET | Vérifier status d'une session |
| `/api/stripe/create-portal-session` | POST | Créer session Customer Portal |
| `/api/webhooks/stripe` | POST | Recevoir events Stripe |
| `/api/auth/generate-app-token` | POST | Générer Firebase Custom Token |

---

## Firebase Configuration

### Firebase Auth

**Méthodes d'authentification à activer :**
- Email/Password
- Google OAuth
- Apple Sign-In

**Custom Claims structure :**

```json
{
  "roles": ["premium"],
  "subStatus": {
    "stripe": true
  }
}
```

Quand un utilisateur s'abonne via Stripe, le webhook doit mettre à jour les custom claims avec `subStatus.stripe = true`.

### Firestore

**Collection `users` (à créer) :**

| Champ | Type | Description |
| --- | --- | --- |
| `uid` | string | Firebase Auth UID |
| `email` | string | Email |
| `firstName` | string | Prénom |
| `lastName` | string | Nom |
| `phone` | string | Téléphone (format international) |
| `dateOfBirth` | timestamp | Date de naissance |
| `stripeCustomerId` | string | Stripe Customer ID |
| `subscriptionStatus` | string | 'none' \| 'active' \| 'canceled' \| 'past_due' |
| `subscriptionPlan` | string \| null | Nom du plan |
| `subscriptionId` | string \| null | Stripe Subscription ID |
| `createdAt` | timestamp | Date de création |
| `updatedAt` | timestamp | Dernière mise à jour |
| `source` | string | 'app' \| 'web-onboarding' |

---

## Stripe Configuration

### Product existant

- **Product ID :** `prod_Rag0FKtF5unIUx`
- **Product Name :** ELEVATE PREMIUM

### Prices à utiliser

| Plan | Price ID | Montant | Intervalle |
| --- | --- | --- | --- |
| Mensuel | `price_1QsmrRFWmvpUDWLuVTElOlQo` | 19,00€ | month / 1 |
| Semestriel | `price_1Qp6q3FWmvpUDWLub7cVDvyP` | 89,94€ | month / 6 |
| Annuel | `price_1Qp6qXFWmvpUDWLujUwlQa9x` | 143,88€ | year / 1 |

### Webhooks à écouter

| Event | Action |
| --- | --- |
| `checkout.session.completed` | Update Firestore + Firebase Custom Claims |
| `customer.subscription.updated` | Update Firestore subscription status |
| `customer.subscription.deleted` | Update Firestore + Custom Claims |
| `invoice.payment_failed` | Update Firestore status = 'past_due' |

### Metadata Strategy

Toujours inclure sur Customer et Checkout Session :
- `firebaseUID` : l'UID Firebase de l'utilisateur
- `source` : 'web-onboarding'

---

## Points Techniques Critiques

### 1. Création Atomique au Step 1

Ordre des opérations :
1. Créer Stripe Customer avec `metadata.firebaseUID`
2. Sauvegarder dans Firestore avec `stripeCustomerId`
3. Envoyer à Klaviyo (non-bloquant)

Si Stripe échoue → ne pas sauvegarder dans Firestore. Rollback propre.

### 2. Mapping Firebase ↔ Stripe

- Toujours créer le Stripe Customer nous-mêmes
- Ne jamais laisser Stripe créer le customer automatiquement au checkout
- `firebaseUID` dans metadata Stripe partout
- `stripeCustomerId` dans Firestore obligatoire

### 3. Session JWT

- Cookie `httpOnly` avec JWT signé
- Contenu : `firebaseUID`, `stripeCustomerId`, `email`
- Expiration : 2h
- Middleware protégeant `/onboarding/*` et `/dashboard`

### 4. Race Condition Thank You

Le webhook peut arriver après l'affichage de Thank You.

Solution : `/api/stripe/session-status` interroge Stripe directement (pas Firestore) pour afficher le succès immédiatement.

### 5. Deep Link + Auto-Login

1. Générer Firebase Custom Token via Admin SDK
2. Passer dans le deep link : `{scheme}://auth?token=xxx`
3. L'app utilise `signInWithCustomToken`

### 6. Custom Claims après paiement

Quand le webhook `checkout.session.completed` arrive :
1. Récupérer `firebaseUID` depuis metadata
2. Update Firestore `subscriptionStatus = 'active'`
3. Update Firebase Custom Claims : `subStatus.stripe = true`

### 7. Vérification Abonnement au Login

Au login, vérifier les custom claims :
- Si `subStatus.stripe === true` → rediriger vers `/dashboard`
- Sinon → rediriger vers `/onboarding`

### 8. Google/Apple OAuth

Utiliser Firebase Admin SDK pour vérifier les tokens OAuth côté serveur. Créer l'utilisateur Firebase si nouveau, puis générer notre JWT de session.

---

## Structure du Projet

```
src/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                      # Redirect → /signup
│   ├── signup/
│   │   └── page.tsx
│   ├── login/
│   │   └── page.tsx
│   ├── onboarding/
│   │   └── page.tsx                  # Single page 4 steps
│   ├── dashboard/
│   │   └── page.tsx                  # Espace abonné
│   └── api/
│       ├── auth/
│       │   ├── signup/route.ts
│       │   ├── login/route.ts
│       │   ├── google/route.ts
│       │   ├── apple/route.ts
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
│   ├── ui/
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   ├── tabs.tsx
│   │   └── ...
│   ├── auth/
│   │   ├── signup-form.tsx
│   │   ├── login-form.tsx
│   │   ├── google-button.tsx
│   │   └── apple-button.tsx
│   └── onboarding/
│       ├── stepper.tsx
│       ├── profile-form.tsx          # Step 1
│       ├── plan-selection.tsx        # Step 2
│       ├── plan-card.tsx
│       ├── checkout.tsx              # Step 3
│       └── thank-you.tsx             # Step 4
├── lib/
│   ├── firebase-admin.ts
│   ├── stripe.ts
│   ├── klaviyo.ts
│   ├── jwt.ts
│   └── validations.ts
├── stores/
│   └── onboarding-store.ts
├── hooks/
│   ├── use-prices.ts
│   └── use-session.ts
├── middleware.ts                      # Protection des routes
└── types/
    └── index.ts
```

---

## Variables d'Environnement

```env
# Firebase Admin
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

# Stripe
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=

# Klaviyo
KLAVIYO_API_KEY=

# JWT
JWT_SECRET=

# App
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_DEEP_LINK_SCHEME=
NEXT_PUBLIC_APP_STORE_URL=
NEXT_PUBLIC_PLAY_STORE_URL=
```

---

## Environnement de Développement

Tout en mode test :
- Firebase : projet test
- Stripe : mode test (clés `sk_test_`, `pk_test_`)
- Klaviyo : compte test

Migration vers prod = changer les variables d'environnement uniquement.

---

## Validations (Zod Schemas)

### Signup

- email : email format, required
- password : min 8 chars, required

### Profile (Step 1)

- firstName : string, min 2 chars, required
- lastName : string, min 2 chars, required  
- phone : format international valide, required
- dateOfBirth : date valide, required

---

## Animations

### Transitions entre Steps

- Utiliser Framer Motion avec AnimatePresence
- `mode="wait"` pour que le step sortant disparaisse avant le nouveau
- Effet slide + fade (x: 50 → 0, opacity: 0 → 1)
- Transition spring (stiffness: 300, damping: 30)

### Micro-interactions

- Hover sur les plan cards
- Animation de sélection du plan
- Loading states sur les boutons
- Success animation sur Thank You

---

## À clarifier plus tard

- Deep link scheme exact (ex: `elevate://`)
- URLs App Store et Play Store
- Events Klaviyo spécifiques
- Infos supplémentaires à afficher sur le dashboard