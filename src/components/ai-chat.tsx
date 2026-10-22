"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { AlertTriangle, Send, Sparkles } from "lucide-react";

interface Message {
  id: string;
  role: string;
  content: string;
}

export function AiChat({
  initialMessages,
  aiConfigured,
}: {
  initialMessages: Message[];
  aiConfigured: boolean;
}) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    setMessages((m) => [...m, { id: `local-${Date.now()}`, role: "user", content: text }]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text }),
    });
    setLoading(false);

    if (!res.ok) {
      toast.error("The assistant couldn't respond. Please try again.");
      return;
    }
    const data = await res.json();

    setMessages((m) => [
      ...m,
      { id: `reply-${Date.now()}`, role: "assistant", content: data.reply ?? "Something went wrong." },
    ]);
  }

  return (
    <div className="card flex flex-col h-[560px] overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <div className="size-8 rounded-lg bg-primary-light text-primary flex items-center justify-center shrink-0">
          <Sparkles className="size-4" />
        </div>
        <div>
          <p className="text-sm font-semibold leading-none">AI Assistant</p>
          <p className="text-xs text-muted mt-0.5">Portfolio-aware guidance</p>
        </div>
      </div>

      {!aiConfigured && (
        <div className="text-xs bg-warning-light text-warning px-4 py-2 border-b border-border flex items-center gap-2">
          <AlertTriangle className="size-3.5 shrink-0" />
          AI replies are offline — an ANTHROPIC_API_KEY hasn&apos;t been configured yet.
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 && (
          <p className="text-sm text-muted">
            Ask about your portfolio, e.g. &quot;Is my net worth too concentrated in one
            asset?&quot; or &quot;What should I consider before buying more land?&quot;
          </p>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex items-end gap-2 ${m.role === "user" ? "flex-row-reverse" : ""}`}
          >
            {m.role === "assistant" && (
              <div className="size-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0 mb-0.5">
                <Sparkles className="size-3.5" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-primary text-primary-foreground rounded-br-sm"
                  : "bg-background border border-border rounded-bl-sm"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted">
            <div className="size-6 rounded-full bg-primary-light text-primary flex items-center justify-center shrink-0">
              <Sparkles className="size-3.5" />
            </div>
            <span className="flex gap-1">
              <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.3s]" />
              <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce [animation-delay:-0.15s]" />
              <span className="size-1.5 rounded-full bg-muted-foreground animate-bounce" />
            </span>
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={send} className="p-3 border-t border-border flex gap-2">
        <input
          className="input"
          placeholder="Ask the assistant..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary px-4 py-2">
          <Send className="size-4" />
        </button>
      </form>
    </div>
  );
}
