"use client";

import { cn } from "@/lib/utils";

interface PlanCardProps {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  selected: boolean;
  onSelect: (id: string) => void;
  discount?: string;
}

export function PlanCard({
  id,
  name,
  price,
  period,
  features,
  selected,
  onSelect,
  discount,
}: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        "relative flex flex-col p-5 rounded-16 border-2 text-left transition-all duration-150 cursor-pointer",
        "hover:border-accent-base/50",
        selected
          ? "border-accent-base bg-accent-base/5"
          : "border-border-base bg-light",
      )}
    >
      {discount && (
        <span className="absolute -top-3 right-4 px-3 py-1 text-xs font-semibold bg-success-base text-static-white rounded-full">
          {discount}
        </span>
      )}

      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-strong">{price}</span>
        <span className="text-soft">{period}</span>
      </div>

      <span className="mt-2 text-base font-medium text-strong">{name}</span>

      <ul className="mt-4 flex flex-col gap-2">
        {features.map((feature) => (
          <li
            key={feature}
            className="flex items-center gap-2 text-s text-soft"
          >
            <CheckIcon className="h-4 w-4 text-success-base flex-shrink-0" />
            {feature}
          </li>
        ))}
      </ul>

      <div
        className={cn(
          "mt-4 pt-4 border-t border-border-soft flex items-center justify-center",
          selected ? "text-accent-base" : "text-soft",
        )}
      >
        <div
          className={cn(
            "h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors",
            selected
              ? "border-accent-base bg-accent-base"
              : "border-border-base",
          )}
        >
          {selected && <CheckIcon className="h-3 w-3 text-static-white" />}
        </div>
        <span className="ml-2 text-s font-medium">
          {selected ? "Sélectionné" : "Sélectionner"}
        </span>
      </div>
    </button>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}
