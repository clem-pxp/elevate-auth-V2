import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import { stripe } from "@/lib/stripe";

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET!;

async function updateSubscriptionStatus(
  firebaseUID: string,
  status: string,
  subscriptionId?: string,
  priceId?: string,
  currentPeriodEnd?: number,
) {
  const db = getAdminFirestore();
  const auth = getAdminAuth();

  const isActive = status === "active" || status === "trialing";

  // Update Firestore (merge: true in case doc doesn't exist yet)
  await db
    .collection("users")
    .doc(firebaseUID)
    .set(
      {
        subscriptionId: subscriptionId ?? null,
        subscriptionStatus: status,
        priceId: priceId ?? null,
        currentPeriodEnd: currentPeriodEnd
          ? new Date(currentPeriodEnd * 1000).toISOString()
          : null,
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

  // Update Firebase Custom Claims
  await auth.setCustomUserClaims(firebaseUID, {
    subStatus: { stripe: isActive ? "active" : "inactive" },
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get("stripe-signature");

    if (!signature) {
      return NextResponse.json(
        { error: "Signature manquante" },
        { status: 400 },
      );
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, WEBHOOK_SECRET);
    } catch {
      return NextResponse.json(
        { error: "Signature invalide" },
        { status: 400 },
      );
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const firebaseUID = session.metadata?.firebaseUID;
        if (!firebaseUID) break;

        if (session.subscription) {
          const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string,
          );
          const periodEnd = (subscription as unknown as Record<string, unknown>)
            .current_period_end as number | undefined;
          await updateSubscriptionStatus(
            firebaseUID,
            subscription.status,
            subscription.id,
            subscription.items.data[0]?.price.id,
            periodEnd,
          );
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(
          subscription.customer as string,
        );

        if (customer.deleted) break;
        const firebaseUID = customer.metadata?.firebaseUID;
        if (!firebaseUID) break;

        const periodEnd = (subscription as unknown as Record<string, unknown>)
          .current_period_end as number | undefined;
        await updateSubscriptionStatus(
          firebaseUID,
          subscription.status,
          subscription.id,
          subscription.items.data[0]?.price.id,
          periodEnd,
        );
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const customer = await stripe.customers.retrieve(
          subscription.customer as string,
        );

        if (customer.deleted) break;
        const firebaseUID = customer.metadata?.firebaseUID;
        if (!firebaseUID) break;

        await updateSubscriptionStatus(firebaseUID, "canceled");
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ error: "Erreur webhook" }, { status: 500 });
  }
}
