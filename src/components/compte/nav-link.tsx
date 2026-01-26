"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { UserIcon } from "@/components/icons/user-icon";

interface NavLinkProps {
  href: string;
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export function NavLink({
  href,
  label = "Profil",
  icon: Icon = UserIcon,
}: NavLinkProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link
      href={href}
      className={`h-9 w-full rounded-12 flex items-center px-2.5 gap-2 transition-colors ${
        isActive
          ? "bg-accent-lighter text-accent-base"
          : "text-soft hover:bg-fade-lighter hover:text-strong"
      }`}
    >
      <Icon className="size-4 shrink-0" />
      <span className="text-s font-medium leading-tight">{label}</span>
    </Link>
  );
}
