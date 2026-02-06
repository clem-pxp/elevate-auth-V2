"use client";

import {
  EmbeddedCheckout,
  EmbeddedCheckoutProvider,
} from "@stripe/react-stripe-js";
import { useCallback, useState } from "react";

import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { getStripePromise } from "@/lib/stripe-client";

export function StepCheckout() {
  const selectedPlanId = useOnboardingStore(
    (state) => state.formData.selectedPlanId,
  );
  const prevStep = useOnboardingStore((state) => state.prevStep);
  const [error, setError] = useState<string | null>(null);

  const fetchClientSecret = useCallback(async () => {
    setError(null);
    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ priceId: selectedPlanId }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const message =
        (data as { error?: string }).error ??
        "Impossible de créer la session de paiement";
      setError(message);
      throw new Error(message);
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

  if (error) {
    return (
      <div className="flex flex-col gap-6">
        <div>
          <h1 className="h4 text-strong">Paiement</h1>
          <p className="mt-2 text-soft">
            Finalise ton abonnement en toute sécurité
          </p>
        </div>
        <div className="flex flex-col gap-4 items-center justify-center py-12">
          <p className="text-error-base text-s text-center">{error}</p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={prevStep}>
              Changer de plan
            </Button>
            <Button onClick={() => setError(null)}>Réessayer</Button>
          </div>
        </div>
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
