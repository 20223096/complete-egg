import { forwardRef, type TextareaHTMLAttributes } from "react";

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  label?: string;
  error?: string;
};

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, className = "", id, ...props }, ref) => {
    const tid = id ?? props.name;
    return (
      <label className="block w-full text-sm font-medium text-[var(--color-text-dark)]" htmlFor={tid}>
        {label ? <span className="mb-1 block text-[var(--color-brown)]">{label}</span> : null}
        <textarea
          ref={ref}
          id={tid}
          className={`mt-1 min-h-[120px] w-full rounded-2xl border border-[var(--color-border)] bg-white px-3 py-2.5 text-[var(--color-text-dark)] outline-none focus:border-[var(--color-primary-dark)] focus:ring-2 focus:ring-[var(--color-primary)]/40 ${className}`}
          {...props}
        />
        {error ? <p className="mt-1 text-xs text-red-600">{error}</p> : null}
      </label>
    );
  }
);
Textarea.displayName = "Textarea";
