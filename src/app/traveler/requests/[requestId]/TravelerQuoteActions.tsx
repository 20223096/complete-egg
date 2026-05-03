"use client";

import { useRouter } from "next/navigation";
import { QuoteCard } from "@/components/QuoteCard";
import { acceptQuote, rejectQuote } from "@/lib/actions/quotes";
import type { Quote } from "@/lib/types/database";

export function TravelerQuoteActions({
  quotes,
  imageByAcc,
}: {
  quotes: Quote[];
  imageByAcc: Record<string, string | undefined>;
}) {
  const router = useRouter();

  return (
    <div className="grid gap-6 md:grid-cols-2">
      {quotes.map((q) => (
        <QuoteCard
          key={q.id}
          quote={q}
          imageUrl={q.accommodation_id ? imageByAcc[q.accommodation_id] : undefined}
          detailHref={`/traveler/quotes/${q.id}`}
          showActions
          onAccept={async () => {
            const res = await acceptQuote(q.id);
            if (res.error) {
              alert(res.error);
              return;
            }
            if (res.reservationId) router.push(`/traveler/reservations/${res.reservationId}/payment`);
            router.refresh();
          }}
          onReject={async () => {
            if (!confirm("이 견적을 거절할까요?")) return;
            const res = await rejectQuote(q.id);
            if (res.error) alert(res.error);
            router.refresh();
          }}
        />
      ))}
    </div>
  );
}
