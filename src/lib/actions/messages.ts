"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function sendConversationMessage(formData: FormData): Promise<void> {
  const conversationId = String(formData.get("conversationId") ?? "");
  const text = String(formData.get("text") ?? "").trim();
  if (!conversationId || !text) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: conv, error: ce } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", conversationId)
    .single();
  if (ce || !conv) return;

  let senderRole: "traveler" | "host" | null = null;
  if (conv.traveler_id === user.id) senderRole = "traveler";
  if (conv.host_id === user.id) senderRole = "host";
  if (!senderRole) return;

  const { error } = await supabase.from("messages").insert({
    conversation_id: conversationId,
    sender_id: user.id,
    sender_role: senderRole,
    text,
  });
  if (error) return;

  revalidatePath("/host/messages");
  revalidatePath("/traveler/messages");
  revalidatePath(`/host/messages/${conversationId}`);
  revalidatePath(`/traveler/messages/${conversationId}`);
}
