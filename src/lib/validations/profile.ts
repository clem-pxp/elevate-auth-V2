import { z } from "zod";

export const profileSchema = z.object({
  firstName: z.string().min(1, "Le prénom est requis"),
  lastName: z.string().min(1, "Le nom est requis"),
  phone: z.string().min(6, "Numéro de téléphone invalide"),
  birthDate: z.string().min(1, "La date de naissance est requise"),
});

export const checkoutSchema = z.object({
  priceId: z.string().min(1, "L'identifiant du prix est requis"),
});

export type ProfileFormData = z.infer<typeof profileSchema>;
