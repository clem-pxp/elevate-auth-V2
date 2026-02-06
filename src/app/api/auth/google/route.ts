import { NextResponse } from "next/server";
import { z } from "zod";

import { signToken, setSessionCookie } from "@/lib/auth/session";
import { getAdminAuth } from "@/lib/config/firebase";
import { getAppUrl } from "@/lib/config/url";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY!;
const SIGN_IN_WITH_IDP_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`;

const googleBody = z.object({
  idToken: z.string().min(1, "Token Google requis"),
});

interface IdpResponse {
  localId: string;
  email: string;
  displayName?: string;
  photoUrl?: string;
  federatedId: string;
}

interface IdpErrorResponse {
  error: { message: string };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = googleBody.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { idToken } = parsed.data;

    // Sign in with Google via Firebase REST API
    const firebaseRes = await fetch(SIGN_IN_WITH_IDP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        postBody: `id_token=${idToken}&providerId=google.com`,
        requestUri: getAppUrl(request),
        returnIdpCredential: true,
        returnSecureToken: true,
      }),
    });

    if (!firebaseRes.ok) {
      const { error } = (await firebaseRes.json()) as IdpErrorResponse;
      console.error("Google sign-in error:", error.message);
      return NextResponse.json(
        { error: "Échec de l'authentification Google" },
        { status: 401 },
      );
    }

    const { localId: uid } = (await firebaseRes.json()) as IdpResponse;

    // Check subscription status
    const userRecord = await getAdminAuth().getUser(uid);
    const claims = (userRecord.customClaims ?? {}) as Record<string, unknown>;
    const subStatus = (claims.subStatus as Record<string, unknown>)?.stripe;
    const hasSubscription = subStatus === "active";

    const token = await signToken(uid);
    await setSessionCookie(token);

    return NextResponse.json({ hasSubscription });
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'authentification Google" },
      { status: 500 },
    );
  }
}
