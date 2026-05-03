"use client";

import { Button } from "@/components/Button";

export function StepForm({
  steps,
  current,
  onStepChange,
  children,
  onBack,
  onNext,
  nextLabel = "다음",
  backLabel = "이전",
  isLast,
  onSubmit,
  submitLabel = "제출하기",
  submitting,
}: {
  steps: string[];
  current: number;
  onStepChange?: (i: number) => void;
  children: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  backLabel?: string;
  isLast?: boolean;
  onSubmit?: () => void;
  submitLabel?: string;
  submitting?: boolean;
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {steps.map((s, i) => (
          <button
            key={s}
            type="button"
            onClick={() => onStepChange?.(i)}
            className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
              i === current
                ? "bg-[var(--color-primary)] text-[var(--color-text-dark)]"
                : "bg-white/70 text-[var(--color-brown)] ring-1 ring-[var(--color-border)]"
            }`}
          >
            {i + 1}. {s}
          </button>
        ))}
      </div>
      <div className="rounded-3xl border border-dashed border-[var(--color-border)] bg-white/60 p-4 sm:p-6">
        {children}
      </div>
      <div className="flex flex-wrap justify-between gap-3">
        <Button type="button" variant="secondary" onClick={onBack} disabled={current === 0}>
          {backLabel}
        </Button>
        {isLast ? (
          <Button type="button" onClick={onSubmit} loading={submitting}>
            {submitLabel}
          </Button>
        ) : (
          <Button type="button" onClick={onNext}>
            {nextLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
