"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { DayPicker } from "react-day-picker";
import { fr } from "date-fns/locale";

import { cn } from "@/lib/utils";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      locale={fr}
      showOutsideDays={showOutsideDays}
      className={cn("p-3", className)}
      classNames={{
        months: "relative flex flex-col gap-4 sm:flex-row",
        month: "flex flex-col gap-4",
        month_caption: "relative mx-10 flex h-7 items-center justify-center",
        caption_label: "text-sm font-medium text-strong",
        dropdowns: "flex items-center justify-center gap-2",
        dropdown_root: "relative inline-flex items-center",
        dropdown: "absolute inset-0 cursor-pointer opacity-0",
        nav: "absolute top-0 flex w-full items-center justify-between",
        button_previous: cn(
          "size-7 inline-flex items-center justify-center rounded-8",
          "bg-transparent text-soft",
          "hover:bg-fade-lighter hover:text-strong",
          "disabled:pointer-events-none disabled:opacity-50",
          "transition-colors",
        ),
        button_next: cn(
          "size-7 inline-flex items-center justify-center rounded-8",
          "bg-transparent text-soft",
          "hover:bg-fade-lighter hover:text-strong",
          "disabled:pointer-events-none disabled:opacity-50",
          "transition-colors",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "hidden",
        weekday: "hidden",
        week: "flex w-full",
        day: "relative flex size-9 flex-1 items-center justify-center p-0 text-center text-sm",
        day_button: cn(
          "relative flex size-9 items-center justify-center rounded-6",
          "text-sm font-normal text-strong",
          "hover:bg-fade-lighter",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-base/20",
          "aria-selected:opacity-100",
          "transition-colors",
        ),
        selected: cn(
          "bg-strong/8 text-strong rounded-6",
          "hover:bg-strong/8",
          "focus:bg-strong/8",
        ),
        today: "bg-fade-lighter font-semibold",
        outside: "text-soft opacity-50 aria-selected:opacity-30",
        disabled: "text-disabled pointer-events-none opacity-50",
        range_start: "rounded-l-8",
        range_end: "rounded-r-8",
        range_middle:
          "rounded-none aria-selected:bg-accent-lighter aria-selected:text-strong",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => {
          const Icon = orientation === "left" ? ChevronLeft : ChevronRight;
          return <Icon className="size-4" />;
        },
        Dropdown: ({ value, options, onChange, "aria-label": ariaLabel }) => {
          const selectedOption = options?.find(
            (option) => option.value === value,
          );
          return (
            <span className="relative inline-flex items-center">
              <span className="inline-flex items-center gap-1 rounded-8 border border-border-base bg-light px-2 py-1 text-sm font-medium text-strong">
                {selectedOption?.label}
                <ChevronRight className="size-3 rotate-90 text-soft" />
              </span>
              <select
                className="absolute inset-0 cursor-pointer opacity-0"
                value={value}
                onChange={(e) => onChange?.(Number(e.target.value))}
                aria-label={ariaLabel}
              >
                {options?.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </span>
          );
        },
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
