import { notFound } from "next/navigation";
import { AccommodationForm } from "../../AccommodationForm";
import { createClient } from "@/lib/supabase/server";
import type { Accommodation } from "@/lib/types/database";

export const dynamic = "force-dynamic";

export default async function EditAccommodationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: acc, error } = await supabase.from("accommodations").select("*").eq("id", id).eq("host_id", user.id).single();
  if (error || !acc) notFound();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-extrabold">숙소 수정</h1>
      <AccommodationForm initial={acc as Accommodation} />
    </div>
  );
}
