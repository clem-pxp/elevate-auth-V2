"use client";

import { ElevateIcon } from "@/components/icons/elevate-icon";
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
