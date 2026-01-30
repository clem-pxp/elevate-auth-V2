"use client";

import { motion } from "motion/react";
import Link from "next/link";

import { AppleButton } from "@/components/auth/apple-button";
import { GoogleButton } from "@/components/auth/google-button";
import { LoginForm } from "@/components/auth/login-form";

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
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M9.98564 22.6472C6.44522 22.6472 4.83182 17.2847 6.23761 11.1414L6.55013 9.94432H22.6024V9.9388C22.7007 8.13436 22.3937 6.32439 21.6461 4.67897C20.9956 3.24778 19.9609 1.75586 18.332 0.935352C17.5712 0.552156 16.1841 0 14.5155 0C13.631 0 12.7453 0.103805 11.8608 0.260618C7.01836 1.24898 3.21732 5.20572 1.81153 10.6202C0.198131 17.1279 3.11351 24 9.62122 24C13.1616 24 16.2846 22.5423 19.0962 16.7634H17.0135C15.399 19.7307 13.2654 22.6461 9.98564 22.6461V22.6472ZM12.0684 1.50959C12.6934 1.24898 13.3704 1.14517 14.1511 1.14517C16.8059 1.14517 18.3685 4.21626 18.4204 8.32982H7.01836C8.11163 4.94621 9.67312 2.44715 12.0684 1.50959Z"
                  fill="white"
                />
              </svg>
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
