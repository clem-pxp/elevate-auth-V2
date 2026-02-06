import Image from "next/image";
import Link from "next/link";

import { ChevronDownIcon } from "@/components/icons/chevron-down-icon";
import { ElevateLogo } from "@/components/logo/elevate-logo";

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
