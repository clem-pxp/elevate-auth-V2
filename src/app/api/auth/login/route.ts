import { NextResponse } from "next/server";

import { signToken, setSessionCookie } from "@/lib/auth/session";
import { getAdminAuth } from "@/lib/config/firebase";
import { loginSchema } from "@/lib/validations/auth";

const FIREBASE_API_KEY = process.env.FIREBASE_API_KEY!;
const SIGN_IN_URL = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${FIREBASE_API_KEY}`;

interface SignInResponse {
  localId: string;
  email: string;
  idToken: string;
}

interface SignInErrorResponse {
  error: { message: string };
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Verify credentials via Firebase Auth REST API
    const firebaseRes = await fetch(SIGN_IN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, returnSecureToken: true }),
    });

    if (!firebaseRes.ok) {
      const { error } = (await firebaseRes.json()) as SignInErrorResponse;
      const msg = error?.message ?? "";

      if (
        msg === "EMAIL_NOT_FOUND" ||
        msg === "INVALID_PASSWORD" ||
        msg === "INVALID_LOGIN_CREDENTIALS"
      ) {
        return NextResponse.json(
          { error: "Email ou mot de passe incorrect" },
          { status: 401 },
        );
      }
      if (msg === "USER_DISABLED") {
        return NextResponse.json(
          { error: "Ce compte a été désactivé" },
          { status: 403 },
        );
      }
      if (msg === "TOO_MANY_ATTEMPTS_TRY_LATER") {
        return NextResponse.json(
          { error: "Trop de tentatives, réessayez plus tard" },
          { status: 429 },
        );
      }

      return NextResponse.json(
        { error: "Erreur lors de la connexion" },
        { status: 500 },
      );
    }

    const { localId: uid } = (await firebaseRes.json()) as SignInResponse;

    // Check subscription status from custom claims
    const userRecord = await getAdminAuth().getUser(uid);
    const claims = (userRecord.customClaims ?? {}) as Record<string, unknown>;
    const subStatus = (claims.subStatus as Record<string, unknown>)?.stripe;
    const hasSubscription = subStatus === "active";

    const token = await signToken(uid);
    await setSessionCookie(token);

    return NextResponse.json({ hasSubscription });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 },
    );
  }
}
