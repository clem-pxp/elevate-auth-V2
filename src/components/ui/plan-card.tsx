"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";

interface PlanCardProps {
  id: string;
  name: string;
  price: string;
  description: string;
  selected: boolean;
  onSelect: (id: string) => void;
  totalPrice?: string;
  badge?: string;
}

const elevateIconPath = (
  <path d="M9.98564 22.6472C6.44522 22.6472 4.83182 17.2847 6.23761 11.1414L6.55013 9.94432H22.6024V9.9388C22.7007 8.13436 22.3937 6.32439 21.6461 4.67897C20.9956 3.24778 19.9609 1.75586 18.332 0.935352C17.5712 0.552156 16.1841 0 14.5155 0C13.631 0 12.7453 0.103805 11.8608 0.260618C7.01836 1.24898 3.21732 5.20572 1.81153 10.6202C0.198131 17.1279 3.11351 24 9.62122 24C13.1616 24 16.2846 22.5423 19.0962 16.7634H17.0135C15.399 19.7307 13.2654 22.6461 9.98564 22.6461V22.6472ZM12.0684 1.50959C12.6934 1.24898 13.3704 1.14517 14.1511 1.14517C16.8059 1.14517 18.3685 4.21626 18.4204 8.32982H7.01836C8.11163 4.94621 9.67312 2.44715 12.0684 1.50959Z" />
);

function ElevateIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      {elevateIconPath}
    </svg>
  );
}

export function PlanCard({
  id,
  name,
  price,
  description,
  selected,
  onSelect,
  totalPrice,
  badge,
}: PlanCardProps) {
  return (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className={cn(
        "w-full text-left rounded-16 border-[0.5px] border-border-base shadow-small transition-colors duration-150 cursor-pointer overflow-hidden",
        selected ? "bg-strong text-light" : "bg-light",
      )}
    >
      <div className="p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "size-7 rounded-10 flex items-center justify-center transition-colors duration-150",
              selected ? "bg-light" : "bg-strong",
            )}
          >
            <ElevateIcon
              className={cn(
                "size-4 transition-colors duration-150",
                selected ? "text-strong" : "text-light",
              )}
            />
          </div>
          <span className="font-medium">{name}</span>
          {badge && (
            <span
              className={cn(
                "text-xs font-medium px-2 py-0.5 rounded-full",
                selected
                  ? "bg-light/20 text-light"
                  : "bg-accent-base/10 text-accent-base",
              )}
            >
              {badge}
            </span>
          )}
        </div>
        <div className="text-right">
          <span className="font-medium">{price}</span>
          {totalPrice && (
            <p
              className={cn(
                "text-xs mt-0.5",
                selected ? "text-light/70" : "text-soft",
              )}
            >
              {totalPrice}
            </p>
          )}
        </div>
      </div>

      <AnimatePresence initial={false}>
        {selected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="px-4 pb-4">
              <p className="text-s font-medium">{description}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}
