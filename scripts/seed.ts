/**
 * Seed demo data (service role). npm run seed
 */
import { createClient } from "@supabase/supabase-js";
import "dotenv/config";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PASS = "WansukMVP123!";

if (!url || !serviceKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}

const admin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function ensureUser(email: string, name: string, role: "traveler" | "host" | "admin") {
  const { data: page } = await admin.auth.admin.listUsers({ perPage: 200 });
  const hit = page?.users?.find((u) => u.email === email);
  if (hit) {
    const { data: p } = await admin.from("profiles").select("id").eq("id", hit.id).maybeSingle();
    if (!p) {
      await admin.from("profiles").insert({
        id: hit.id,
        role: role === "admin" ? "traveler" : role,
        name,
        email,
        phone: null,
      });
      if (role === "admin") await admin.from("profiles").update({ role: "admin" }).eq("id", hit.id);
      if (role === "host") {
        await admin.from("host_subscriptions").upsert(
          { host_id: hit.id, plan: "free", status: "active" },
          { onConflict: "host_id" }
        );
      }
    }
    return hit.id;
  }

  const signupRole = role === "admin" ? "traveler" : role;
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASS,
    email_confirm: true,
    user_metadata: { name, role: signupRole },
  });
  if (error || !data.user) throw new Error(`${email}: ${error?.message}`);
  const id = data.user.id;

  await admin.from("profiles").insert({
    id,
    role: signupRole as "traveler" | "host",
    name,
    email,
    phone: null,
  });
  if (role === "admin") {
    await admin.from("profiles").update({ role: "admin" }).eq("id", id);
  }
  if (signupRole === "host") {
    await admin.from("host_subscriptions").upsert(
      { host_id: id, plan: "free", status: "active" },
      { onConflict: "host_id" }
    );
  }
  return id;
}

async function main() {
  const t1 = await ensureUser("traveler1@wansuk.demo", "김여행", "traveler");
  const t2 = await ensureUser("traveler2@wansuk.demo", "이순로", "traveler");
  const h1 = await ensureUser("host1@wansuk.demo", "박펜션", "host");
  const h2 = await ensureUser("host2@wansuk.demo", "최풀빌", "host");
  const h3 = await ensureUser("host3@wansuk.demo", "정한옥", "host");
  await ensureUser("admin@wansuk.demo", "운영자", "admin");

  const demoImg = "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80";

  const accSpecs = [
    { host: h1, name: "강릉 바다펜션", region: "강릉", type: "pension" },
    { host: h1, name: "경포대 가족펜션", region: "강릉", type: "pension" },
    { host: h2, name: "속초 오션풀빌라", region: "속초", type: "poolvilla" },
    { host: h2, name: "양양 서핑게하", region: "양양", type: "guesthouse" },
    { host: h3, name: "전주 한옥스테이", region: "전주", type: "hanok" },
  ];

  const accIds: string[] = [];
  for (const a of accSpecs) {
    const { data: existing } = await admin.from("accommodations").select("id").eq("host_id", a.host).eq("name", a.name).maybeSingle();
    if (existing?.id) {
      accIds.push(existing.id as string);
      continue;
    }
    const { data, error } = await admin
      .from("accommodations")
      .insert({
        host_id: a.host,
        name: a.name,
        region: a.region,
        detail_region: "시내",
        address: `${a.region} 시 연동`,
        description: "완숙 시드 숙소입니다.",
        accommodation_type: a.type,
        base_price: 180000,
        max_people: 6,
        images: [demoImg],
        options: ["주차", "wifi"],
        check_in_time: "15:00",
        check_out_time: "11:00",
        phone: "010-0000-0000",
        status: "active",
      })
      .select("id")
      .single();
    if (error) throw new Error(`accommodation ${a.name}: ${error.message}`);
    accIds.push(data!.id as string);
  }

  const { count: seedReqCount } = await admin
    .from("traveler_requests")
    .select("id", { count: "exact", head: true })
    .like("message", "%완숙 시드%");

  if (!seedReqCount) {
    const payloads = [
      { traveler: t1, region: "강릉", budget: [120000, 280000] as const },
      { traveler: t1, region: "속초", budget: [150000, 350000] as const },
      { traveler: t2, region: "양양", budget: [90000, 220000] as const },
      { traveler: t2, region: "전주", budget: [80000, 200000] as const },
      { traveler: t1, region: "제주", budget: [200000, 500000] as const },
    ];
    let i = 0;
    for (const r of payloads) {
      i += 1;
      const { data: prof } = await admin.from("profiles").select("name").eq("id", r.traveler).single();
      const { error } = await admin.from("traveler_requests").insert({
        traveler_id: r.traveler,
        traveler_name: (prof?.name as string) ?? "여행객",
        region: r.region,
        detail_region: "시내",
        check_in_date: `2026-06-${String(10 + i).padStart(2, "0")}`,
        check_out_date: `2026-06-${String(13 + i).padStart(2, "0")}`,
        people_count: 2 + (i % 3),
        room_count: 1,
        budget_min: r.budget[0],
        budget_max: r.budget[1],
        accommodation_type: "any",
        required_options: ["parking", "oceanView"],
        preferred_mood: ["family"],
        message: `완숙 시드 요청 ${r.region} #${i}`,
        status: "open",
      });
      if (error) throw new Error(`request: ${error.message}`);
    }
  }

  const { data: targetReqs } = await admin
    .from("traveler_requests")
    .select("id,traveler_id,region,check_in_date,check_out_date,people_count")
    .like("message", "%완숙 시드%")
    .order("created_at", { ascending: true })
    .limit(5);

  const reqs = targetReqs ?? [];
  let qi = 0;
  for (const req of reqs) {
    const { count: c } = await admin.from("quotes").select("id", { count: "exact", head: true }).eq("request_id", req.id);
    if ((c ?? 0) > 0) continue;
    const batch: Record<string, unknown>[] = [];
    for (let k = 0; k < 2; k += 1) {
      const accId = accIds[qi % accIds.length];
      qi += 1;
      const { data: acc } = await admin.from("accommodations").select("host_id,name").eq("id", accId).single();
      if (!acc) continue;
      batch.push({
        request_id: req.id,
        traveler_id: req.traveler_id,
        host_id: acc.host_id,
        accommodation_id: accId,
        accommodation_name: acc.name,
        title: `${req.region} 맞춤 제안 ${qi}`,
        price: 160000 + qi * 5000,
        original_price: 200000,
        discount_rate: 15,
        check_in_date: req.check_in_date,
        check_out_date: req.check_out_date,
        people_count: req.people_count,
        included_options: ["주차", "조식"],
        message_from_host: "시드 견적입니다. 편하게 문의 주세요.",
        cancellation_policy: "MVP 단계 환불은 협의",
        status: "sent",
        is_auto_generated: false,
      });
    }
    if (batch.length) {
      const { error } = await admin.from("quotes").insert(batch);
      if (error) console.warn("quotes", req.id, error.message);
    }
  }

  const { data: firstReq } = await admin
    .from("traveler_requests")
    .select("id")
    .eq("traveler_id", t1)
    .like("message", "%완숙 시드%")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (firstReq?.id) {
    const { data: quotesFor } = await admin.from("quotes").select("*").eq("request_id", firstReq.id);
    const firstQuote = quotesFor?.[0];
    if (firstQuote?.id) {
      await admin.from("quotes").update({ status: "rejected" }).eq("request_id", firstReq.id).neq("id", firstQuote.id);
      await admin.from("quotes").update({ status: "accepted" }).eq("id", firstQuote.id);
      await admin.from("traveler_requests").update({ status: "accepted" }).eq("id", firstReq.id);
      await admin.from("reservations").delete().eq("quote_id", firstQuote.id);
      const { error: re } = await admin.from("reservations").insert({
        request_id: firstReq.id,
        quote_id: firstQuote.id,
        traveler_id: firstQuote.traveler_id,
        host_id: firstQuote.host_id,
        accommodation_id: firstQuote.accommodation_id,
        price: firstQuote.price,
        status: "payment_pending",
        payment_status: "pending",
      });
      if (re) console.warn("reservation", re.message);
      const { data: resv } = await admin.from("reservations").select("id").eq("quote_id", firstQuote.id).maybeSingle();
      if (resv?.id) {
        await admin.from("conversations").delete().eq("reservation_id", resv.id);
        await admin.from("conversations").insert({
          reservation_id: resv.id,
          traveler_id: firstQuote.traveler_id,
          host_id: firstQuote.host_id,
          quote_id: firstQuote.id,
        });
      }
    }
  }

  console.log("Seed 완료. 비밀번호:", PASS);
  console.log("traveler1@wansuk.demo / host1@wansuk.demo / admin@wansuk.demo");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
