"use client";

import * as React from "react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { CalendarIcon } from "@/components/icons/calendar-icon";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerProps {
  date?: Date;
  onDateChange?: (date: Date | undefined) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  fromYear?: number;
  toYear?: number;
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Sélectionner",
  className,
  disabled,
  fromYear = 1920,
  toYear = new Date().getFullYear(),
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          disabled={disabled}
          className={cn(
            "flex items-center gap-2 w-full h-10 md:h-9 px-4",
            "text-base md:text-s text-left",
            "bg-light",
            "border border-border-base",
            "rounded-10",
            "outline-none",
            "transition-colors duration-150",
            "hover:border-border-strong",
            "focus:border-accent-base focus:ring-2 focus:ring-accent-base/20",
            "disabled:bg-fade-lighter disabled:text-disabled disabled:cursor-not-allowed",
            "text-strong",
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-soft" />
          <span
            className="truncate"
            style={
              !date
                ? { color: "color-mix(in srgb, currentColor 50%, transparent)" }
                : undefined
            }
          >
            {date ? format(date, "d MMMM yyyy", { locale: fr }) : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[var(--radix-popover-trigger-width)] overflow-hidden p-0 rounded-16 shadow-xl"
        align="start"
      >
        <Calendar
          mode="single"
          selected={date}
          defaultMonth={date}
          captionLayout="dropdown"
          fromYear={fromYear}
          toYear={toYear}
          onSelect={(selectedDate) => {
            onDateChange?.(selectedDate);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
