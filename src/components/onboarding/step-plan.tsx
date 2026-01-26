"use client";

import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/ui/plan-card";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";

const plans = [
  {
    id: "monthly",
    name: "Mensuel",
    price: "29,99€",
    period: "/mois",
    features: [
      "Accès illimité à tous les programmes",
      "Suivi personnalisé",
      "Support prioritaire",
    ],
  },
  {
    id: "quarterly",
    name: "Trimestriel",
    price: "79,99€",
    period: "/trimestre",
    discount: "-11%",
    features: [
      "Accès illimité à tous les programmes",
      "Suivi personnalisé",
      "Support prioritaire",
      "Coaching mensuel",
    ],
  },
  {
    id: "annual",
    name: "Annuel",
    price: "249,99€",
    period: "/an",
    discount: "-30%",
    features: [
      "Accès illimité à tous les programmes",
      "Suivi personnalisé",
      "Support prioritaire",
      "Coaching mensuel",
      "Contenu exclusif",
    ],
  },
];

export function StepPlan() {
  const { formData, updateFormData, nextStep, prevStep } = useOnboardingStore();

  const handleSelect = (planId: string) => {
    updateFormData({ selectedPlanId: planId });
  };

  const handleNext = () => {
    if (formData.selectedPlanId) {
      nextStep();
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="h4 text-strong">Choisis ton plan</h1>
        <p className="mt-2 text-soft">
          Sélectionne l&apos;offre qui correspond le mieux à tes objectifs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            id={plan.id}
            name={plan.name}
            price={plan.price}
            period={plan.period}
            features={plan.features}
            discount={plan.discount}
            selected={formData.selectedPlanId === plan.id}
            onSelect={handleSelect}
          />
        ))}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Précédent
        </Button>
        <Button
          onClick={handleNext}
          disabled={!formData.selectedPlanId}
          className="flex-1"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
