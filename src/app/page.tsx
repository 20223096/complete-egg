import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-brown)] ring-1 ring-[var(--color-border)]">
            proposal-based · warm · simple
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-[var(--color-text-dark)] sm:text-5xl">
            원하는 숙소 조건을 적으면
            <br />
            <span className="text-[var(--color-brown)]">사장님 견적</span>이 도착해요
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-700">
            완숙은 여행객의 요청서를 받은 숙소 사장님이 조건에 맞는 견적을 보내고, 여행객이 비교·수락할 수 있는 숙박 역제안 플랫폼입니다.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/signup?role=traveler">
              <Button type="button">요청서 작성하기</Button>
            </Link>
            <Link href="/signup?role=host">
              <Button type="button" variant="secondary">
                사장님으로 견적 보내기
              </Button>
            </Link>
          </div>
        </div>
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#FFF3CC] to-white">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[var(--color-primary)]/40 blur-2xl" />
          <ul className="relative space-y-4 text-sm font-medium text-[var(--color-text-dark)]">
            <li className="flex gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-[var(--color-border)]">
              <span className="text-xl">1</span>
              <span>지역·일정·예산을 단계별로 입력해 요청서를 완성해요.</span>
            </li>
            <li className="flex gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-[var(--color-border)]">
              <span className="text-xl">2</span>
              <span>맞는 숙소에서 견적이 도착하면 카드로 비교해요.</span>
            </li>
            <li className="flex gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-[var(--color-border)]">
              <span className="text-xl">3</span>
              <span>마음에 드는 견적을 수락하고 예약·결제 준비로 이어져요.</span>
            </li>
          </ul>
        </Card>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          { t: "따뜻한 크림 톤 UX", d: "부담 없는 카드형 인터페이스로 견적을 한눈에 비교합니다." },
          { t: "역제안 구조", d: "여행객이 먼저 조건을 제시하고, 사장님이 맞춤 견적으로 응답합니다." },
          { t: "수락 후 대화", d: "견적이 확정되면 전용 메시지로 일정을 맞춰 나갈 수 있어요." },
        ].map((x) => (
          <Card key={x.t}>
            <h3 className="text-lg font-bold text-[var(--color-brown)]">{x.t}</h3>
            <p className="mt-2 text-sm text-slate-700">{x.d}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
