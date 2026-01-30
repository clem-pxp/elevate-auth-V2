import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";

export async function POST() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { uid } = session;

    const db = getAdminFirestore();
    const userDoc = await db.collection("users").doc(uid).get();
    const stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "Aucun abonnement trouvé" },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: `${appUrl}/compte/facturation`,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (error) {
    console.error("Create portal session error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'accès au portail de facturation" },
      { status: 500 },
    );
  }
}
