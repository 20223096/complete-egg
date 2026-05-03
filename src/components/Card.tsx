import type { HTMLAttributes } from "react";

export function Card({
  className = "",
  children,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-3xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-[0_8px_30px_rgba(122,90,46,0.08)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
