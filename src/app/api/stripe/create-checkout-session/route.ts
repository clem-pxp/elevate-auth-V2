import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";

const checkoutBody = z.object({
  priceId: z.string().min(1, "L'identifiant du prix est requis"),
});

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = checkoutBody.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { priceId } = parsed.data;
    const { uid } = session;

    // Get Stripe Customer ID from Firestore
    const db = getAdminFirestore();
    const userDoc = await db.collection("users").doc(uid).get();
    const stripeCustomerId = userDoc.data()?.stripeCustomerId;

    if (!stripeCustomerId) {
      return NextResponse.json(
        { error: "Profil incomplet, veuillez compléter votre profil" },
        { status: 400 },
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    const checkoutSession = await getStripe().checkout.sessions.create({
      customer: stripeCustomerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: "subscription",
      ui_mode: "embedded",
      return_url: `${appUrl}/signup?session_id={CHECKOUT_SESSION_ID}`,
      metadata: { firebaseUID: uid },
    });

    return NextResponse.json({ clientSecret: checkoutSession.client_secret });
  } catch (error) {
    console.error("Create checkout session error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la session de paiement" },
      { status: 500 },
    );
  }
}
