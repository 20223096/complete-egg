"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { acceptQuote, rejectQuote } from "@/lib/actions/quotes";

export function QuoteActions({ quoteId, requestId }: { quoteId: string; requestId: string }) {
  const router = useRouter();

  return (
    <div className="flex flex-wrap gap-3">
      <Button
        type="button"
        onClick={async () => {
          const res = await acceptQuote(quoteId);
          if (res.error) {
            alert(res.error);
            return;
          }
          if (res.reservationId) router.push(`/traveler/reservations/${res.reservationId}/payment`);
          router.refresh();
        }}
      >
        수락하기
      </Button>
      <Button
        type="button"
        variant="danger"
        onClick={async () => {
          if (!confirm("이 견적을 거절할까요?")) return;
          const res = await rejectQuote(quoteId);
          if (res.error) alert(res.error);
          else router.push(`/traveler/requests/${requestId}`);
          router.refresh();
        }}
      >
        거절하기
      </Button>
    </div>
  );
}
