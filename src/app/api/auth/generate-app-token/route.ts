import { NextResponse } from "next/server";

import { getSessionUser } from "@/lib/auth";
import { getAdminAuth } from "@/lib/firebase-admin";

export async function POST() {
  try {
    const session = await getSessionUser();
    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { uid } = session;
    const scheme = process.env.NEXT_PUBLIC_DEEP_LINK_SCHEME || "elevateapp";

    const customToken = await getAdminAuth().createCustomToken(uid);
    const deepLink = `${scheme}://auth?token=${customToken}`;

    return NextResponse.json({ token: customToken, deepLink });
  } catch (error) {
    console.error("Generate app token error:", error);
    return NextResponse.json(
      { error: "Erreur lors de la génération du token" },
      { status: 500 },
    );
  }
}
