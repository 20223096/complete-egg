import { type ButtonHTMLAttributes, forwardRef } from "react";

const variants = {
  primary:
    "bg-[var(--color-primary)] text-[var(--color-text-dark)] hover:bg-[var(--color-primary-dark)] shadow-sm",
  secondary:
    "bg-white text-[var(--color-text-dark)] border border-[var(--color-border)] hover:bg-[var(--color-bg)]",
  outline:
    "border-2 border-[var(--color-brown)] text-[var(--color-brown)] bg-transparent hover:bg-[var(--color-bg)]",
  ghost: "text-[var(--color-brown)] hover:bg-white/60",
  danger: "bg-red-600 text-white hover:bg-red-700",
} as const;

type Variant = keyof typeof variants;

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  loading?: boolean;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", loading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`inline-flex items-center justify-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brown)] disabled:opacity-50 ${variants[variant]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        ) : null}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
