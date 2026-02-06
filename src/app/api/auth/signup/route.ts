import { NextResponse } from "next/server";
import { z } from "zod";

import { signToken, setSessionCookie } from "@/lib/auth/session";
import { getAdminAuth } from "@/lib/config/firebase";

const signupBody = z.object({
  email: z.email("Email invalide"),
  password: z
    .string()
    .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = signupBody.safeParse(body);

    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }

    const { email, password } = parsed.data;

    const userRecord = await getAdminAuth().createUser({ email, password });

    const token = await signToken(userRecord.uid);
    await setSessionCookie(token);

    return NextResponse.json({ uid: userRecord.uid });
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error) {
      const code = (error as { code: string }).code;

      if (code === "auth/email-already-exists") {
        return NextResponse.json(
          { error: "Cet email est déjà utilisé" },
          { status: 409 },
        );
      }
      if (code === "auth/invalid-email") {
        return NextResponse.json({ error: "Email invalide" }, { status: 400 });
      }
      if (code === "auth/invalid-password") {
        return NextResponse.json(
          { error: "Le mot de passe doit contenir au moins 6 caractères" },
          { status: 400 },
        );
      }
    }

    console.error("Signup error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 },
    );
  }
}
