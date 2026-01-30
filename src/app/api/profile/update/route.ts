import { NextResponse } from "next/server";
import { z } from "zod";

import { getSessionUser } from "@/lib/auth";
import { getAdminAuth, getAdminFirestore } from "@/lib/firebase-admin";
import { getStripe } from "@/lib/stripe";

const profileBody = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(6, "Numéro de téléphone invalide"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
});

export async function POST(request: Request) {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = profileBody.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { firstName, lastName, phone, birthDate } = parsed.data;
    const { uid } = session;

    // Check if profile already exists (idempotent)
    const db = getAdminFirestore();
    const userDoc = await db.collection("users").doc(uid).get();

    if (userDoc.exists && userDoc.data()?.stripeCustomerId) {
      return NextResponse.json({});
    }

    // Get email from Firebase Auth
    const userRecord = await getAdminAuth().getUser(uid);
    const email = userRecord.email!;

    // Step 1: Create Stripe Customer FIRST (atomic: if this fails, don't save to Firestore)
    const customer = await getStripe().customers.create({
      email,
      name: `${firstName} ${lastName}`,
      phone,
      metadata: { firebaseUID: uid },
    });

    // Step 2: Save to Firestore
    await db.collection("users").doc(uid).set(
      {
        email,
        firstName,
        lastName,
        phone,
        birthDate,
        stripeCustomerId: customer.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return NextResponse.json({});
  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 },
    );
  }
}
