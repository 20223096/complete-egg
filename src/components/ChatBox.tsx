"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/Button";
import { Textarea } from "@/components/Textarea";
import type { Message } from "@/lib/types/database";

export function ChatBox({
  conversationId,
  messages,
  senderRole,
  sendAction,
}: {
  conversationId: string;
  messages: Message[];
  senderRole: "traveler" | "host";
  sendAction: (formData: FormData) => Promise<void>;
}) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex h-[min(70vh,560px)] flex-col rounded-3xl border border-[var(--color-border)] bg-white p-4 shadow-inner">
      <div className="flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-slate-500">첫 인사를 남겨보세요.</p>
        ) : (
          messages.map((m) => {
            const mine = m.sender_role === senderRole;
            return (
              <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    mine ? "bg-[var(--color-primary)] text-[var(--color-text-dark)]" : "bg-[var(--color-bg)]"
                  }`}
                >
                  <p>{m.text}</p>
                  <p className="mt-1 text-[10px] opacity-70">
                    {new Date(m.created_at).toLocaleString("ko-KR")}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
      <form
        className="mt-3 flex flex-col gap-2 border-t border-[var(--color-border)] pt-3"
        action={async (fd) => {
          startTransition(async () => {
            await sendAction(fd);
            setText("");
            router.refresh();
          });
        }}
      >
        <input type="hidden" name="conversationId" value={conversationId} />
        <Textarea
          name="text"
          label=""
          placeholder="메시지를 입력하세요"
          value={text}
          onChange={(e) => setText(e.target.value)}
          required
        />
        <Button type="submit" disabled={pending || !text.trim()} loading={pending}>
          보내기
        </Button>
      </form>
    </div>
  );
}
