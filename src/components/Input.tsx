import { forwardRef, type InputHTMLAttributes } from "react";

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  error?: string;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <label className="block w-full text-sm font-medium text-[var(--color-text-dark)]" htmlFor={inputId}>
        {label ? <span className="mb-1 block text-[var(--color-brown)]">{label}</span> : null}
        <input
          ref={ref}
          id={inputId}
          className={`mt-1 w-full rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-[var(--color-text-dark)] shadow-inner outline-none transition placeholder:text-slate-400 focus:border-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-primary)]/40 ${className}`}
          {...props}
        />
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </label>
    );
  }
);
Input.displayName = "Input";
