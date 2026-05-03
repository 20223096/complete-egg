import { Card } from "@/components/Card";

export function DashboardStatCard({
  title,
  value,
  hint,
}: {
  title: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <Card>
      <p className="text-sm font-medium text-[var(--color-brown)]">{title}</p>
      <p className="mt-2 text-3xl font-extrabold text-[var(--color-text-dark)]">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-600">{hint}</p> : null}
    </Card>
  );
}
