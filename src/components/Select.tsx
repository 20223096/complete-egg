import { forwardRef, type SelectHTMLAttributes } from "react";

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  error?: string;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, className = "", id, children, ...props }, ref) => {
    const selectId = id ?? props.name;
    return (
      <label className="block w-full text-sm font-medium text-[var(--color-text-dark)]" htmlFor={selectId}>
        {label ? <span className="mb-1 block text-[var(--color-brown)]">{label}</span> : null}
        <select
          ref={ref}
          id={selectId}
          className={`mt-1 w-full rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-[var(--color-text-dark)] outline-none focus:border-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-primary)]/40 ${className}`}
          {...props}
        >
          {children}
        </select>
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </label>
    );
  }
);
Select.displayName = "Select";
