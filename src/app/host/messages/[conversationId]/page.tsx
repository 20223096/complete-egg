import { notFound } from "next/navigation";
import { ChatBox } from "@/components/ChatBox";
import { sendConversationMessage } from "@/lib/actions/messages";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HostConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: conv, error } = await supabase.from("conversations").select("*").eq("id", conversationId).single();
  if (error || !conv || conv.host_id !== user.id) notFound();

  const { data: msgs } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-extrabold">고객과의 대화</h1>
      <ChatBox
        conversationId={conversationId}
        messages={msgs ?? []}
        senderRole="host"
        sendAction={sendConversationMessage}
      />
    </div>
  );
}
