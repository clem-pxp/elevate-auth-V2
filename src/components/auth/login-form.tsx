"use client";

import { useForm } from "@tanstack/react-form";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/validations";

export function LoginForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: loginSchema,
    },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(value),
        });

        if (!response.ok) {
          const data = await response.json();
          setServerError(data.error || "Une erreur est survenue");
          return;
        }

        const data = await response.json();
        if (data.hasSubscription) {
          router.push("/compte");
        } else {
          router.push("/signup");
        }
      } catch {
        setServerError("Une erreur est survenue");
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        e.stopPropagation();
        form.handleSubmit();
      }}
      className="flex flex-col gap-2 mx-auto max-w-[21.25rem] w-full"
    >
      {serverError && (
        <div className="p-3 rounded-10 bg-error-lighter text-error-base text-s">
          {serverError}
        </div>
      )}

      <form.Field name="email">
        {(field) => (
          <Input
            label="Email"
            type="email"
            placeholder="Email"
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
            placeholder="Mot de passe"
            value={field.state.value}
            onChange={(e) => field.handleChange(e.target.value)}
            onBlur={field.handleBlur}
            error={field.state.meta.errors?.[0]?.message}
            autoComplete="current-password"
          />
        )}
      </form.Field>

      <form.Subscribe selector={(state) => state.isSubmitting}>
        {(isSubmitting) => (
          <Button
            type="submit"
            className="mt-1 h-11.5 rounded-16 "
            fullWidth
            isLoading={isSubmitting}
          >
            Se connecter
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
