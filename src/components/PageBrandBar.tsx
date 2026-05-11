import Link from "next/link";

/** Mobile-style top row like mockups: brand left, context right */
export function PageBrandBar({ rightLabel, href = "/" }: { rightLabel?: string | null; href?: string }) {
  return (
    <div className="mb-4 flex items-start justify-between gap-3">
      <Link
        href={href}
        className="font-sans text-2xl font-extrabold lowercase tracking-tight text-[var(--color-logo)] [text-shadow:0_1px_0_rgba(255,255,255,0.6)]"
        style={{ fontFamily: "var(--font-nunito), ui-rounded, system-ui" }}
      >
        wansook
      </Link>
      {rightLabel ? <span className="max-w-[55%] pt-1 text-right text-sm font-medium text-slate-500">{rightLabel}</span> : null}
    </div>
  );
}
