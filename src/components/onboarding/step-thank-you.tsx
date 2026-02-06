"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { AppStoreIcon } from "@/components/icons/app-store-icon";
import { PlayStoreIcon } from "@/components/icons/play-store-icon";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/stores/onboarding-store";
import type { SessionStatusResponse } from "@/types/stripe";

type SessionState =
  | { status: "loading" }
  | { status: "success"; email: string | null }
  | { status: "error" };

export function StepThankYou() {
  const checkoutSessionId = useOnboardingStore(
    (state) => state.formData.checkoutSessionId,
  );
  const [sessionState, setSessionState] = useState<SessionState>(
    checkoutSessionId
      ? { status: "loading" }
      : { status: "success", email: null },
  );

  useEffect(() => {
    if (!checkoutSessionId) return;

    async function checkStatus() {
      try {
        const res = await fetch(
          `/api/stripe/session-status?session_id=${checkoutSessionId}`,
        );
        if (!res.ok) throw new Error("Failed to fetch session status");

        const data = (await res.json()) as SessionStatusResponse;

        if (data.status === "complete" && data.paymentStatus === "paid") {
          setSessionState({ status: "success", email: data.customerEmail });
        } else {
          setSessionState({ status: "error" });
        }
      } catch {
        setSessionState({ status: "error" });
      }
    }

    checkStatus();
  }, [checkoutSessionId]);

  if (sessionState.status === "loading") {
    return (
      <div className="flex flex-col items-center gap-4 py-20 animate-pulse">
        <div className="h-7 w-56 bg-strong/8 rounded-8" />
        <div className="h-5 w-72 bg-strong/8 rounded-8" />
      </div>
    );
  }

  if (sessionState.status === "error") {
    return (
      <div className="flex flex-col items-center gap-4 py-20">
        <h2 className="h5 text-center">Paiement en cours de vérification</h2>
        <p className="text-base text-soft text-center">
          Votre paiement est en cours de traitement. Vous recevrez un email de
          confirmation.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center md:gap-12 gap-8">
      <div className="flex flex-col w-full gap-2">
        <h2 className="h5 text-center">Bienvenue chez Elevate</h2>
        <p className="text-base text-soft text-center">
          Votre abonnement est maintenant actif
        </p>
      </div>

      <div className="flex flex-col items-center gap-10 w-full">
        <div className="flex flex-col items-center gap-4">
          <h3 className="h5">Téléchargez l&apos;app</h3>
          <div className="grid grid-cols-2 gap-3">
            <a
              href={process.env.NEXT_PUBLIC_APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 px-4 bg-strong text-static-white rounded-12 hover:opacity-90 transition-opacity"
            >
              <AppStoreIcon />
              <span className="text-s font-medium">App Store</span>
            </a>
            <a
              href={process.env.NEXT_PUBLIC_PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 px-4 bg-strong text-static-white rounded-12 hover:opacity-90 transition-opacity"
            >
              <PlayStoreIcon />
              <span className="text-s font-medium">Play Store</span>
            </a>
          </div>
        </div>

        <div className="relative mx-auto max-w-[21.25rem] w-full">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border-soft" />
          </div>
          <div className="relative flex justify-center text-s">
            <span className="bg-main px-4 text-soft">ou</span>
          </div>
        </div>

        <Link
          href="/compte"
          className={cn(buttonVariants(), "w-full max-w-[21.25rem]")}
        >
          Accéder à mon compte
        </Link>
      </div>
    </div>
  );
}
