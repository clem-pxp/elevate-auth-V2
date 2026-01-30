import { NextRequest, NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";

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
      await stripe.checkout.sessions.retrieve(sessionId);

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
