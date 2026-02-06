import "server-only";

import { getAdminAuth } from "@/lib/config/firebase";

export async function getSubscriptionStatus(
  uid: string,
): Promise<{ hasSubscription: boolean }> {
  const userRecord = await getAdminAuth().getUser(uid);
  const claims = (userRecord.customClaims ?? {}) as Record<string, unknown>;
  const subStatus = (claims.subStatus as Record<string, unknown>)?.stripe;
  const hasSubscription = subStatus === "active" || subStatus === "trialing";
  return { hasSubscription };
}
