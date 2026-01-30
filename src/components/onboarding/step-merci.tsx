"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import type { SessionStatusResponse } from "@/lib/types/stripe";

type SessionState =
  | { status: "loading" }
  | { status: "success"; email: string | null }
  | { status: "error" };

export function StepMerci() {
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
              <svg
                width="20"
                height="24"
                viewBox="0 0 20 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16.498 12.7905C16.4855 10.6905 17.418 9.12798 19.303 7.98048C18.243 6.47298 16.6455 5.64798 14.543 5.49048C12.5505 5.33298 10.373 6.64548 9.60297 6.64548C8.78547 6.64548 6.85547 5.53798 5.28547 5.53798C2.05047 5.58548 -1.10703 8.02798 -1.10703 13.053C-1.10703 14.5905 -0.826028 16.178 -0.263528 17.8155C0.476472 19.968 3.08547 25.068 5.80797 24.978C7.27047 24.9405 8.30547 24.003 10.218 24.003C12.073 24.003 13.033 24.978 14.668 24.978C17.4105 24.9405 19.7655 20.293 20.468 18.133C16.3005 16.1505 16.498 12.903 16.498 12.7905ZM13.593 3.71298C15.138 1.87298 14.988 0.195478 14.9405 -0.379522C13.573 -0.302022 12.0005 0.540478 11.103 1.60048C10.113 2.73048 9.52797 4.11048 9.65047 5.46048C11.128 5.57548 12.493 4.81048 13.593 3.71298Z"
                  fill="currentColor"
                />
              </svg>
              <span className="text-s font-medium">App Store</span>
            </a>
            <a
              href={process.env.NEXT_PUBLIC_PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 h-12 px-4 bg-strong text-static-white rounded-12 hover:opacity-90 transition-opacity"
            >
              <svg
                width="20"
                height="22"
                viewBox="0 0 20 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M0.546875 0.695312C0.203125 1.05469 0 1.60156 0 2.29688V19.7031C0 20.3984 0.203125 20.9453 0.546875 21.3047L0.617188 21.375L10.3984 11.5938V11.4062L0.617188 1.625L0.546875 0.695312Z"
                  fill="currentColor"
                />
                <path
                  d="M13.6641 14.8594L10.3984 11.5938V11.4062L13.6641 8.14062L13.7578 8.19531L17.6016 10.4062C18.6953 11.0234 18.6953 11.9766 17.6016 12.6016L13.7578 14.8047L13.6641 14.8594Z"
                  fill="currentColor"
                />
                <path
                  d="M13.7578 14.8047L10.3984 11.5L0.546875 21.3047C0.890625 21.6641 1.44531 21.7109 2.07031 21.3516L13.7578 14.8047Z"
                  fill="currentColor"
                />
                <path
                  d="M13.7578 8.19531L2.07031 1.64844C1.44531 1.28906 0.890625 1.33594 0.546875 1.69531L10.3984 11.5L13.7578 8.19531Z"
                  fill="currentColor"
                />
              </svg>
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
