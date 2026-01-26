import { type ComponentProps } from "react";

type CardProps = ComponentProps<"div">;

export function Card({ className = "", children, ...props }: CardProps) {
  return (
    <div
      className={`
        bg-light
        border-[0.5px] border-border-soft
        rounded-20
        shadow-small
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
}
