import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/Badge";
import { Card } from "@/components/Card";
import { QUOTE_STATUS_LABELS } from "@/lib/constants/labels";
import { createClient } from "@/lib/supabase/server";
import { QuoteActions } from "./QuoteActions";

export const dynamic = "force-dynamic";

export default async function TravelerQuoteDetailPage({
  params,
}: {
  params: Promise<{ quoteId: string }>;
}) {
  const { quoteId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: quote, error } = await supabase.from("quotes").select("*").eq("id", quoteId).single();
  if (error || !quote || quote.traveler_id !== user.id) notFound();

  const { data: acc } = await supabase
    .from("accommodations")
    .select("images,description,region,detail_region")
    .eq("id", quote.accommodation_id)
    .single();

  const image = (acc?.images as string[] | undefined)?.[0];

  return (
    <div className="space-y-6">
      <Link href={`/traveler/requests/${quote.request_id}`} className="text-sm text-[var(--color-brown)] underline">
        ← 요청서로
      </Link>
      <div className="flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-extrabold">{quote.title}</h1>
        <Badge>{QUOTE_STATUS_LABELS[quote.status] ?? quote.status}</Badge>
      </div>
      {image ? (
        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl border border-[var(--color-border)]">
          <Image src={image} alt="" fill className="object-cover" sizes="100vw" />
        </div>
      ) : null}
      <Card>
        <p className="text-sm text-[var(--color-brown)]">{quote.accommodation_name}</p>
        <p className="mt-1 text-xs text-slate-500">
          {acc?.region} {acc?.detail_region}
        </p>
        <p className="mt-2 text-3xl font-extrabold">{Number(quote.price).toLocaleString()}원</p>
        {quote.original_price ? (
          <p className="text-sm text-slate-500 line-through">{Number(quote.original_price).toLocaleString()}원</p>
        ) : null}
        {acc?.description ? <p className="mt-4 text-sm text-slate-700">{acc.description}</p> : null}
      </Card>
      <Card>
        <h2 className="font-bold text-[var(--color-brown)]">포함 옵션</h2>
        <ul className="mt-2 flex flex-wrap gap-2">
          {(quote.included_options as string[])?.map((o) => (
            <li key={o} className="rounded-full bg-[var(--color-bg)] px-3 py-1 text-xs">
              {o}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h2 className="font-bold text-[var(--color-brown)]">사장님 메시지</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm">{quote.message_from_host}</p>
      </Card>
      <Card>
        <h2 className="font-bold text-[var(--color-brown)]">취소·환불 안내</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm">{quote.cancellation_policy}</p>
      </Card>
      {quote.status === "sent" ? <QuoteActions quoteId={quote.id} requestId={quote.request_id as string} /> : null}
    </div>
  );
}
