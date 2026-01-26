"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const mockUser = {
  email: "jean.dupont@email.com",
  firstName: "Jean",
  lastName: "Dupont",
  phone: "+33 6 12 34 56 78",
  dateOfBirth: "15 mars 1990",
};

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 py-4 border-b border-border-soft last:border-b-0">
      <span className="text-s text-soft">{label}</span>
      <span className="text-base text-strong">{value}</span>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="h5 text-strong">Mon profil</h1>
        <p className="mt-1 text-soft">Gérez vos informations personnelles</p>
      </div>

      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-l font-semibold text-strong">
            Informations personnelles
          </h2>
          <Button variant="outline" className="h-9 px-4 text-s">
            Modifier
          </Button>
        </div>

        <div className="divide-y divide-border-soft">
          <InfoRow label="Email" value={mockUser.email} />
          <InfoRow label="Prénom" value={mockUser.firstName} />
          <InfoRow label="Nom" value={mockUser.lastName} />
          <InfoRow label="Téléphone" value={mockUser.phone} />
          <InfoRow label="Date de naissance" value={mockUser.dateOfBirth} />
        </div>
      </Card>
    </div>
  );
}
