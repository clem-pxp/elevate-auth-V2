"use client";

import { Button } from "@/components/ui/button";
import { PlanCard } from "@/components/ui/plan-card";
import { StepPlanSkeleton } from "@/components/onboarding/step-plan-skeleton";
import { useOnboardingStore } from "@/stores/onboarding-store";
import { useStripePrices } from "@/hooks/use-stripe-prices";
import type { StripePriceData } from "@/types/stripe";

function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount / 100);
}

function computeMonthlyEquivalent(
  unitAmount: number,
  interval: string,
  intervalCount: number,
): number {
  switch (interval) {
    case "year":
      return Math.round(unitAmount / (12 * intervalCount));
    case "month":
      return Math.round(unitAmount / intervalCount);
    case "week":
      return Math.round((unitAmount * 52) / (12 * intervalCount));
    case "day":
      return Math.round((unitAmount * 365) / (12 * intervalCount));
    default:
      return unitAmount;
  }
}

function getIntervalLabel(interval: string, count: number): string {
  if (count === 1) {
    switch (interval) {
      case "month":
        return "mois";
      case "year":
        return "an";
      case "week":
        return "semaine";
      case "day":
        return "jour";
      default:
        return interval;
    }
  }

  switch (interval) {
    case "month":
      return count === 3
        ? "trimestre"
        : count === 6
          ? "semestre"
          : `${count} mois`;
    case "year":
      return `${count} ans`;
    case "week":
      return `${count} semaines`;
    case "day":
      return `${count} jours`;
    default:
      return `${count} ${interval}`;
  }
}

function getBillingLabel(interval: string, intervalCount: number): string {
  if (interval === "month" && intervalCount === 1) return "Mensuel";
  if (interval === "month" && intervalCount === 3) return "Trimestriel";
  if (interval === "month" && intervalCount === 6) return "Semestriel";
  if (interval === "year" && intervalCount === 1) return "Annuel";
  return `${intervalCount} ${getIntervalLabel(interval, intervalCount)}`;
}

function getPlanDisplayData(price: StripePriceData) {
  const unitAmount = price.unitAmount ?? 0;
  const interval = price.interval ?? "month";
  const intervalCount = price.intervalCount ?? 1;

  const monthlyEquivalent = computeMonthlyEquivalent(
    unitAmount,
    interval,
    intervalCount,
  );
  const monthlyPrice = `${formatCurrency(monthlyEquivalent, price.currency)}/mois`;
  const isMonthly = interval === "month" && intervalCount === 1;
  const totalPrice = isMonthly
    ? undefined
    : `${formatCurrency(unitAmount, price.currency)}/${getIntervalLabel(interval, intervalCount)}`;

  const billingLabel = getBillingLabel(interval, intervalCount);

  return {
    id: price.id,
    name: billingLabel,
    price: monthlyPrice,
    description: price.description,
    totalPrice,
  };
}

export function StepPlan() {
  const selectedPlanId = useOnboardingStore(
    (state) => state.formData.selectedPlanId,
  );
  const updateFormData = useOnboardingStore((state) => state.updateFormData);
  const nextStep = useOnboardingStore((state) => state.nextStep);
  const prevStep = useOnboardingStore((state) => state.prevStep);

  const { data: prices, isLoading, error, refetch } = useStripePrices();

  const handleSelect = (planId: string) => {
    updateFormData({ selectedPlanId: planId });
  };

  const handleNext = () => {
    if (selectedPlanId) {
      nextStep();
    }
  };

  if (isLoading) {
    return <StepPlanSkeleton />;
  }

  if (error || !prices) {
    return (
      <div className="flex flex-col gap-4 items-center justify-center py-20">
        <p className="text-soft">
          Impossible de charger les plans. Veuillez réessayer.
        </p>
        <Button variant="outline" onClick={() => refetch()}>
          Réessayer
        </Button>
      </div>
    );
  }

  const plans = prices.map(getPlanDisplayData);

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="h4 text-strong">Choisis ton plan</h1>
        <p className="mt-2 text-soft">
          Sélectionne l&apos;offre qui correspond le mieux à tes objectifs
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.id}
            id={plan.id}
            name={plan.name}
            price={plan.price}
            description={plan.description}
            selected={selectedPlanId === plan.id}
            onSelect={handleSelect}
            totalPrice={plan.totalPrice}
          />
        ))}
      </div>

      <div className="flex gap-4">
        <Button variant="outline" onClick={prevStep} className="flex-1">
          Précédent
        </Button>
        <Button
          onClick={handleNext}
          disabled={!selectedPlanId}
          className="flex-1"
        >
          Suivant
        </Button>
      </div>
    </div>
  );
}
