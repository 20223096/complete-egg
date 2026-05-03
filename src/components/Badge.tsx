const tones = {
  default: "bg-[var(--color-primary)]/30 text-[var(--color-text-dark)] border-[var(--color-border)]",
  brown: "bg-[#F5E6C8] text-[var(--color-brown)] border-[var(--color-border)]",
  success: "bg-emerald-100 text-emerald-900 border-emerald-200",
  warning: "bg-amber-100 text-amber-900 border-amber-200",
  muted: "bg-slate-100 text-slate-700 border-slate-200",
} as const;

export function Badge({
  children,
  tone = "default",
  className = "",
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}
