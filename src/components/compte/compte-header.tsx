import Image from "next/image";
import Link from "next/link";

import { ElevateLogo } from "@/components/logo/elevate-logo";

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M6.7315 2.19329L4.16752 4.75726L1.60356 2.19329C1.34584 1.93557 0.929522 1.93557 0.671804 2.19329C0.414086 2.45101 0.414086 2.86732 0.671804 3.12504L3.70495 6.15819C3.96267 6.4159 4.37898 6.4159 4.6367 6.15819L7.66984 3.12504C7.92756 2.86732 7.92756 2.45101 7.66984 2.19329C7.41212 1.94218 6.98922 1.93557 6.7315 2.19329Z"
        fill="#5B5C5E"
      />
    </svg>
  );
}

export function CompteHeader() {
  return (
    <header className="flex items-center justify-between">
      <Link href="/">
        <ElevateLogo />
      </Link>

      <div className="flex items-center justify-center gap-1.5 py-1 pr-2.5 pl-1 rounded-full bg-strong/4">
        <div className="rounded-full overflow-hidden size-5">
          <Image
            src="/images/avatar_01.png"
            alt="Avatar"
            width={20}
            height={20}
            className="size-full object-cover"
          />
        </div>
        <span className="text-xs font-medium text-strong leading-tight">
          Clément
        </span>
        <ChevronDownIcon className="size-2" />
      </div>
    </header>
  );
}
