"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { AppleButton } from "@/components/auth/apple-button";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";
import { ElevateIcon } from "@/components/icons/elevate-icon";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-main p-5 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full max-w-md"
      >
        <div className="md:bg-light rounded-0 md:rounded-24 md:shadow-small md:border-[0.5px] md:border-border-base p-0 md:p-8">
          <div className="flex flex-col gap-6">
            <div className="size-15 rounded-20 flex items-center justify-center bg-[#E3B6C2] mx-auto">
              <ElevateIcon className="size-6" color="white" />
            </div>
            <div className="text-center">
              <h1 className="h4 text-strong">Bon retour parmi nous !</h1>
              <p className="mt-1.5 text-soft">Connectez-vous pour continuer</p>
            </div>

            <LoginForm />

            <div className="relative mx-auto max-w-[21.25rem] w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border-soft" />
              </div>
              <div className="relative flex justify-center text-s">
                <span className="bg-light px-4 text-soft">
                  ou continuer avec
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1.5 mx-auto max-w-[21.25rem] w-full">
              <GoogleButton />
              <AppleButton />
            </div>

            <p className="text-center text-s text-soft">
              Pas encore de compte ?{" "}
              <Link
                href="/signup"
                className="font-medium text-accent-base hover:text-blue-600"
              >
                Créer un compte
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
