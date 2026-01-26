"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockSubscription = {
  status: "active",
  planName: "Premium Annuel",
  price: "99,99 €/an",
  nextBillingDate: "15 janvier 2027",
  startDate: "15 janvier 2026",
};

function StatusBadge({ status }: { status: string }) {
  const isActive = status === "active";
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-1 rounded-full text-s font-medium
        ${isActive ? "bg-success-lighter text-success-base" : "bg-fade-lighter text-soft"}
      `}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full mr-1.5 ${isActive ? "bg-success-base" : "bg-soft"}`}
      />
      {isActive ? "Actif" : "Inactif"}
    </span>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-border-soft last:border-b-0">
      <span className="text-soft">{label}</span>
      <span className="text-strong font-medium">{value}</span>
    </div>
  );
}

export default function FacturationPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="h5 text-strong">Facturation</h1>
        <p className="mt-1 text-soft">
          Gérez votre abonnement et vos paiements
        </p>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-l font-semibold text-strong">Mon abonnement</h2>
          <StatusBadge status={mockSubscription.status} />
        </div>

        <div>
          <InfoRow label="Forfait" value={mockSubscription.planName} />
          <InfoRow label="Prix" value={mockSubscription.price} />
          <InfoRow
            label="Début de l'abonnement"
            value={mockSubscription.startDate}
          />
          <InfoRow
            label="Prochaine facturation"
            value={mockSubscription.nextBillingDate}
          />
        </div>

        <div className="mt-6 pt-6 border-t border-border-soft">
          <Button variant="outline" fullWidth>
            Gérer mon abonnement
          </Button>
        </div>
      </Card>
    </div>
  );
}
