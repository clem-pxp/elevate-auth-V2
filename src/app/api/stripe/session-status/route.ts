import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth/session";
import { getStripe } from "@/lib/config/stripe";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const sessionId = request.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.json(
        { error: "session_id est requis" },
        { status: 400 },
      );
    }

    const checkoutSession =
      await getStripe().checkout.sessions.retrieve(sessionId);

    // Verify the session belongs to the authenticated user
    if (checkoutSession.metadata?.firebaseUID !== session.uid) {
      return NextResponse.json(
        { error: "Accès non autorisé" },
        { status: 403 },
      );
    }

    return NextResponse.json({
      status: checkoutSession.status,
      paymentStatus: checkoutSession.payment_status,
      customerEmail: checkoutSession.customer_details?.email,
    });
  } catch (error) {
    console.error("Session status error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification du paiement" },
      { status: 500 },
    );
  }
}
