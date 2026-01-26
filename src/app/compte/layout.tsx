"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";

import { CompteHeader } from "@/components/compte/compte-header";
import { NavLink } from "@/components/compte/nav-link";
import { UserIcon } from "@/components/icons/user-icon";
import { CreditCardIcon } from "@/components/icons/credit-card-icon";
import { ArrowBackIcon } from "@/components/icons/arrow-back-icon";

export default function CompteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-main">
      <div className="p-5 md:p-10">
        <div className="w-full mx-auto max-w-[75rem]">
          <CompteHeader />

          <div className="mt-6 md:mt-10 flex flex-col gap-6 md:grid md:grid-cols-12 md:gap-8">
            <aside className="md:col-span-3">
              <nav className="flex flex-col gap-1">
                <Link
                  href="/"
                  className="h-9 w-full rounded-12 flex items-center px-2.5 gap-2 text-soft hover:bg-fade-lighter hover:text-strong transition-colors mb-4"
                >
                  <ArrowBackIcon className="size-3.5 shrink-0" />
                  <span className="text-s font-medium leading-tight">
                    Retourner sur le site
                  </span>
                </Link>

                <NavLink
                  href="/compte/profile"
                  label="Profil"
                  icon={UserIcon}
                />
                <NavLink
                  href="/compte/facturation"
                  label="Facturation"
                  icon={CreditCardIcon}
                />
              </nav>
            </aside>

            <main className="md:col-[4/-1]">
              <motion.div
                key={pathname}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              >
                {children}
              </motion.div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
