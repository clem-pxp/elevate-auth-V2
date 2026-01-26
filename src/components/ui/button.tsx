"use client";

import { type ComponentProps, forwardRef } from "react";

import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "default" | "icon";

interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-base text-static-white hover:bg-blue-600 active:bg-blue-700 disabled:bg-blue-300 shadow-btn",
  secondary:
    "bg-fade-lighter text-strong hover:bg-fade-light active:bg-border-base disabled:bg-fade-lighter disabled:text-disabled shadow-btn",
  outline:
    "bg-transparent border border-border-base text-strong hover:bg-fade-lighter active:bg-fade-light disabled:text-disabled disabled:border-border-soft shadow-btn",
  ghost:
    "bg-transparent text-strong hover:bg-fade-lighter active:bg-fade-light disabled:text-disabled",
};

const sizeStyles: Record<ButtonSize, string> = {
  default: "h-10 px-6",
  icon: "h-8 w-8 p-0",
};

export function buttonVariants({
  variant = "primary",
  size = "default",
}: { variant?: ButtonVariant; size?: ButtonSize } = {}) {
  return cn(
    "inline-flex items-center justify-center gap-2 font-medium text-base rounded-12 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed",
    variantStyles[variant],
    sizeStyles[size],
  );
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "default",
      isLoading = false,
      fullWidth = false,
      disabled,
      className = "",
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          buttonVariants({ variant, size }),
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {isLoading && (
          <svg
            className="animate-spin h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
