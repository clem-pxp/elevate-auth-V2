export interface FirestoreUser {
  uid?: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  birthDate: string;
  stripeCustomerId: string;
  subscriptionStatus?: "none" | "active" | "canceled" | "past_due" | "trialing";
  subscriptionPlan?: string | null;
  subscriptionId?: string | null;
  createdAt: string;
  updatedAt: string;
  source?: "app" | "web-onboarding";
}

export interface UserCustomClaims {
  subStatus?: {
    stripe: "active" | "inactive";
  };
  roles?: string[];
}
