'use client';

import { type ComponentProps, forwardRef, useId } from 'react';

interface InputProps extends ComponentProps<'input'> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({ label, error, className = '', id, ...props }, ref) => {
  const generatedId = useId();
  const inputId = id || generatedId;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-s font-medium leading-tight text-fade">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={`
            h-10 md:h-10 px-3.5
            text-base md:text-s text-strong
            bg-light
            border border-border-base
            rounded-10
            outline-none
            transition-colors duration-150
            placeholder:text-placeholder
            hover:border-border-strong
            focus:border-accent-base focus:ring-2 focus:ring-accent-base/20
            disabled:bg-fade-lighter disabled:text-disabled disabled:cursor-not-allowed
            ${error ? 'border-error-base focus:border-error-base focus:ring-error-base/20' : ''}
            ${className}
          `}
        {...props}
      />
      {error && <p className="text-s text-error-base">{error}</p>}
    </div>
  );
});

Input.displayName = 'Input';
