"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { useCallback } from "react";

import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { getStripePromise } from "@/lib/stripe-client";

export function StepCheckout() {
  const selectedPlanId = useOnboardingStore(
    (state) => state.formData.selectedPlanId,
  );
  const prevStep = useOnboardingStore((state) => state.prevStep);

  const fetchClientSecret = useCallback(async () => {
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: selectedPlanId }),
    });

    if (!res.ok) {
      throw new Error("Impossible de créer la session de paiement");
    }

    const data = (await res.json()) as { clientSecret: string };
    return data.clientSecret;
  }, [selectedPlanId]);

  if (!selectedPlanId) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center py-20">
        <p className="text-soft">
          Aucun plan sélectionné. Veuillez revenir en arrière.
        </p>
        <Button variant="outline" onClick={prevStep}>
          Retour
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="h4 text-strong">Paiement</h1>
        <p className="mt-2 text-soft">
          Finalise ton abonnement en toute sécurité
        </p>
      </div>

      <div className="rounded-16 border-[0.5px] border-border-base overflow-hidden">
        <EmbeddedCheckoutProvider
          stripe={getStripePromise()}
          options={{ fetchClientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </div>

      <Button variant="outline" onClick={prevStep} className="w-full">
        Changer de plan
      </Button>
    </div>
  );
}
