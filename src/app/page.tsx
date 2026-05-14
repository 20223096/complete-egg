import Link from "next/link";
import { Button } from "@/components/Button";
import { Card } from "@/components/Card";

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:py-16">
      <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div>
          <p className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-semibold text-[var(--color-brown)] ring-1 ring-[var(--color-border)]">
            AI 양면 번역 · 직거래 복원 · OTA가 못 따라오는 구조
          </p>
          <h1 className="mt-4 text-4xl font-extrabold leading-tight text-[var(--color-text-dark)] sm:text-5xl">
            말로만 설명해도
            <br />
            <span className="text-[var(--color-brown)]">AI가 요청서</span>로 바꿔 드려요
          </h1>
          <p className="mt-5 max-w-xl text-lg text-slate-700">
            완숙은 구매자의 인지 부담(조건 정리·표현)과 사장님의 인지 부담(가격·설득 문구)을 AI가 흡수합니다. 야놀자·여기어때처럼
            수수료에 묶인 익명 1회성이 아니라, <strong className="font-semibold">단골·1:1 메시지·묘사 프로필</strong>로 관계를 쌓는 쪽이 목표예요.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/traveler/requests/new?flash=1">
              <Button type="button">오늘 밤 빈 방 요청하기</Button>
            </Link>
            <Link href="/traveler/requests/new">
              <Button type="button" variant="secondary">
                자연어로 요청서 만들기
              </Button>
            </Link>
            <Link href="/signup?role=host">
              <Button type="button" variant="outline">
                사장님으로 입장
              </Button>
            </Link>
          </div>
        </div>
        <Card className="relative overflow-hidden bg-gradient-to-br from-[#FFF3CC] to-white">
          <div className="absolute -right-6 -top-6 h-32 w-32 rounded-full bg-[var(--color-primary)]/40 blur-2xl" />
          <ul className="relative space-y-4 text-sm font-medium text-[var(--color-text-dark)]">
            <li className="flex gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-[var(--color-border)]">
              <span className="text-xl">①</span>
              <span>
                <strong>오늘 밤 빈 방</strong>으로 들어오면 OTA에 없는 즉흥 출발·할인 각도가 열립니다. 빈 방은 100% 손실이라 사장님 할인
                의지가 가장 큽니다.
              </span>
            </li>
            <li className="flex gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-[var(--color-border)]">
              <span className="text-xl">②</span>
              <span>친구에게 말하듯 적으면 AI가 깔끔한 요청서로 변환해 조건에 맞는 사장님께 전달합니다.</span>
            </li>
            <li className="flex gap-3 rounded-2xl bg-white/80 p-4 ring-1 ring-[var(--color-border)]">
              <span className="text-xl">③</span>
              <span>사장님은 OTA 시세를 기준으로 한 할인 제안가를 자동 추천받고, 가격만 넣고 견적을 발송할 수 있어요.</span>
            </li>
          </ul>
        </Card>
      </section>

      <section className="mt-16 grid gap-6 md:grid-cols-3">
        {[
          {
            t: "OTA가 못 따라오는 이유",
            d: "수수료를 낮추면 스스로 모델이 무너지고, 단골·직거래는 광고 기반 OTA와 구조적으로 충돌합니다.",
          },
          { t: "AI 양면 번역", d: "나를 표현하기 어려운 구매자, 남을 설득하기 어려운 사장님 — 그 간극을 AI가 매끄럽게 메웁니다." },
          { t: "1:1 메시지", d: "견적이 이어지면 전용 대화로 일정을 맞추며, 장기적으로는 단골 명부·취향 프로필로 확장할 수 있어요." },
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
