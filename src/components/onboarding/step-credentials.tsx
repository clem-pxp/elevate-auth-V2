"use client";

import { useForm } from "@tanstack/react-form";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { useOnboardingStore } from "@/lib/stores/onboarding-store";
import { signupSchema } from "@/lib/validations";

const PhoneInput = dynamic(
  () => import("@/components/ui/phone-input").then((m) => m.PhoneInput),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col gap-1.5">
        <span className="text-s font-medium leading-tight text-fade">
          Téléphone
        </span>
        <div className="h-10 md:h-9 bg-fade-lighter rounded-10 animate-pulse" />
      </div>
    ),
  },
);

export function StepCredentials() {
  const { formData, updateFormData, nextStep } = useOnboardingStore();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      birthDate: formData.birthDate,
      email: formData.email,
      password: formData.password,
    },
    validators: {
      onSubmit: signupSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const response = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: value.email,
            password: value.password,
          }),
        });

        const data = await response.json();

        if (!response.ok) {
          setServerError(data.error || "Une erreur est survenue");
          return;
        }

        const profileResponse = await fetch("/api/profile/update", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            firstName: value.firstName,
            lastName: value.lastName,
            phone: value.phone,
            birthDate: value.birthDate ? value.birthDate.toISOString() : "",
          }),
        });

        if (!profileResponse.ok) {
          const profileData = await profileResponse.json();
          setServerError(
            profileData.error || "Erreur lors de la création du profil",
          );
          return;
        }

        updateFormData({ ...value, firebaseUID: data.uid, password: "" });
        nextStep();
      } catch {
        setServerError("Une erreur est survenue");
      }
    },
  });

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="h4 text-strong">Démarre ton aventure</h1>
        <p className="mt-2 text-soft">
          Rejoignez Elevate et commencez votre transformation
        </p>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-x-4 md:gap-y-5"
      >
        {serverError && (
          <div className="p-3 rounded-10 bg-error-lighter text-error-base text-s md:col-span-2">
            {serverError}
          </div>
        )}

        <form.Field name="firstName">
          {(field) => (
            <Input
              label="Prénom"
              type="text"
              placeholder="Jean"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors?.[0]?.message}
              autoComplete="given-name"
            />
          )}
        </form.Field>

        <form.Field name="lastName">
          {(field) => (
            <Input
              label="Nom"
              type="text"
              placeholder="Dupont"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors?.[0]?.message}
              autoComplete="family-name"
            />
          )}
        </form.Field>

        <form.Field name="phone">
          {(field) => (
            <PhoneInput
              label="Téléphone"
              value={field.state.value}
              onChange={(value) => field.handleChange(value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors?.[0]?.message}
            />
          )}
        </form.Field>

        <form.Field name="birthDate">
          {(field) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-s font-medium leading-tight text-fade">
                Date de naissance
              </label>
              <DatePicker
                date={field.state.value ?? undefined}
                onDateChange={(date) => field.handleChange(date ?? null)}
                toYear={new Date().getFullYear() - 13}
              />
              {field.state.meta.errors?.[0]?.message && (
                <span className="text-xs text-error-base">
                  {field.state.meta.errors[0].message}
                </span>
              )}
            </div>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <Input
              label="Email"
              type="email"
              placeholder="vous@exemple.com"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors?.[0]?.message}
              autoComplete="email"
            />
          )}
        </form.Field>

        <form.Field name="password">
          {(field) => (
            <Input
              label="Mot de passe"
              type="password"
              placeholder="8 caractères minimum"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              error={field.state.meta.errors?.[0]?.message}
              autoComplete="new-password"
            />
          )}
        </form.Field>

        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button
              type="submit"
              fullWidth
              isLoading={isSubmitting}
              className="md:col-span-2"
            >
              Créer mon compte
            </Button>
          )}
        </form.Subscribe>

        <p className="text-center text-s text-soft md:col-span-2">
          Déjà un compte ?{" "}
          <Link
            href="/login"
            className="font-medium text-accent-base hover:text-blue-600"
          >
            Se connecter
          </Link>
        </p>
      </form>
    </div>
  );
}
